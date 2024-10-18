const db = require('../db'); // Assuming you have set up your MySQL connection here
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
        const minPasswordLength = 8; // Minimum length for password
        if (req.body.password.length < minPasswordLength) {
            return res.status(400).json({ status: false, message: "Password should be at least " + minPasswordLength + " characters long" });
        }

        // Check if email already exists using raw SQL
        const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
        const emailExist = await db.query(checkEmailQuery, [req.body.email]);
        if (emailExist[0].length > 0) {
            return res.status(400).json({ status: false, message: "Email already exists" });
        }

        // If email doesn't exist, proceed with creating the new user
        const encryptedPassword = CryptoJS.AES.encrypt(req.body.password, process.env.SECRET).toString();
        const createUserQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';

        try {
            await db.query(createUserQuery, [req.body.username, req.body.email, encryptedPassword]);
            res.status(201).json({ status: true, message: "User created successfully" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: false, message: error.message });
        }
    },

    loginUser: async (req, res) => {
        try {
            // Retrieve user using raw SQL
            const findUserQuery = 'SELECT * FROM users WHERE email = ?';
            const [user] = await db.query(findUserQuery, [req.body.email]);
            if (!user || user.length === 0) {
                return res.status(401).json({ status: false, message: 'Wrong Email Address' });
            }

            const decryptedPass = CryptoJS.AES.decrypt(user[0].password, process.env.SECRET);
            const decryptedPassword = decryptedPass.toString(CryptoJS.enc.Utf8);

            if (decryptedPassword !== req.body.password) {
                return res.status(401).json({ status: false, message: 'Provide a correct password' });
            }

            const userToken = jwt.sign(
                {
                    id: user[0].id,
                    username: user[0].username,
                },
                process.env.JWT_SECRET,
                { expiresIn: '21d' }
            );

            const { password, createdAt, updatedAt, ...others } = user[0];

            res.status(200).json({ ...others, userToken });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, error: error.message });
        }
    },
};
