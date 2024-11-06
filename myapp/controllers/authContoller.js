//authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Token = require('../models/tokenModel'); 
const transporter = require('../config/nodemailerConfig');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); 

exports.register = (req, res) => {
    const { username, password, email, role } = req.body; 

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ message: 'Error hashing password' });

        User.create(username, hashedPassword, email, role, (error, result) => { 
            if (error) return res.status(500).json({ message: 'Error creating user' });
            res.status(201).json({ message: 'User registered successfully' });
        });
    });
};
exports.login = (req, res) => {
    const { username, password } = req.body;

    User.findByUsername(username, (error, results) => {
        if (error || results.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, match) => {
            if (err || !match) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role }, 
                '789',
                { expiresIn: '1h' }
            );

            Token.updateOrInsert(user.username, token, (updateError) => {
                if (updateError) {
                    return res.status(500).json({ message: 'Error saving token' });
                }

                res.json({
                    message: 'Welcome to RentItOut platform',
                    token: token
                });
            });
        });
    });
};


exports.requestPasswordReset = (req, res) => {
    const { username } = req.body; 

    User.findByUsername(username, (error, results) => {
        if (error || results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = results[0];
        const token = crypto.randomBytes(20).toString('hex');

        Token.updateOrInsert(user.username, token, (tokenError) => {
            if (tokenError) {
                return res.status(500).json({ message: 'Error saving reset token' });
            }


            const mailOptions = {
                from: 's12027619@stu.najah.edu',
                to: user.email,
                subject: 'Password Reset',
                html: `Click <a href="http://your-app.com/reset-password/${token}">here</a> to reset your password. Your token is: <strong>${token}</strong>` // استخدام HTML للتنسيق
            };

            transporter.sendMail(mailOptions, (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error sending email' });
                }

                res.json({ message: 'Reset link sent to email' });
            });
        });
    });
};


exports.resetPassword = (req, res) => {
    const { token, newPassword } = req.body;

    Token.findByToken(token, (tokenError, tokenResults) => {
        if (tokenError || tokenResults.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const username = tokenResults[0].username; 

        bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
            if (err) {
                console.error(err); 
                return res.status(500).json({ message: 'Error hashing password' });
            }

            User.updatePassword(username, hashedPassword, (updateError) => {
                if (updateError) {
                    console.error(updateError); 
                    return res.status(500).json({ message: 'Error updating password' });
                }

                Token.deleteByToken(token, (deleteError) => {
                    if (deleteError) {
                        console.error(deleteError); 
                        return res.status(500).json({ message: 'Error deleting reset token' });
                    }

                    res.json({ message: 'Password updated successfully' });
                });
            });
        });
    });
};