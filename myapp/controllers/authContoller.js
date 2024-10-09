const User = require('../models/User');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

module.exports = {
    createUser: async (req, res) => {
        // Validate email
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!emailRegex.test(req.body.email)) {
            return res.status(400).json({ status: false, message: "Invalid email format" });
        }

        // Validate password length
        const minPasswordLength = 8; // يمكنك ضبط الطول الأدنى
        if (req.body.password.length < minPasswordLength) {
            return res.status(400).json({ status: false, message: "Password should be at least " + minPasswordLength + " characters long" });
        }

        // Check if email already exists
        const emailExist = await User.findOne({ where: { email: req.body.email } });
        if (emailExist) {
            return res.status(400).json({ status: false, message: "Email already exists" });
        }

        // If email doesn't exist, proceed with creating the new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: CryptoJS.AES.encrypt(
                req.body.password,
                process.env.SECRET
            ).toString(),
        });

        try {
            await newUser.save();
            res.status(201).json({ status: true, message: "User created successfully" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: false, message: error.message });
        }
    },

    loginUser: async (req, res) => {
        try {
            const user = await User.findOne({ where: { email: req.body.email } });
            if (!user) {
                return res.status(401).json({ status: false, message: 'Wrong Email Address' });
            }

            const decryptedPass = CryptoJS.AES.decrypt(
                user.password,
                process.env.SECRET
            );
            const decryptedPassword = decryptedPass.toString(CryptoJS.enc.Utf8);

            if (decryptedPassword !== req.body.password) {
                return res.status(401).json({ status: false, message: 'Provide a correct password' });
            }

            const userToken = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                },
                process.env.JWT_SECRET,
                { expiresIn: '21d' }
            );

            const { password, createdAt, updatedAt, ...others } = user;

            res.status(200).json({ ...others, userToken });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, error: error.message });
        }
    },
};
