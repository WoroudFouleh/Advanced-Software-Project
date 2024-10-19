const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Token = require('../models/tokenModel'); // Ensure the correct path to your token model

// List of allowed roles
const allowedRoles = ['admin', 'owner', 'user', 'delivery']; // Including 'delivery'

// Register a new user
exports.register = (req, res) => {
    const { username, password, role } = req.body;

    // Check if all fields are provided
    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Username, password, and role are required.' });
    }

    // Validate the role
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Allowed roles are: admin, owner, user, delivery.' });
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ message: 'Error hashing password' });

        // Create the user in the database
        User.create(username, hashedPassword, role, (error, result) => {
            if (error) return res.status(500).json({ message: 'Error creating user' });

            res.status(201).json({ message: 'User registered successfully' });
        });
    });
};

// User login
exports.login = (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    // Find the user by username
    User.findByUsername(username, (error, results) => {
        if (error || results.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = results[0];

        // Compare the password
        bcrypt.compare(password, user.password, (err, match) => {
            if (err || !match) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }

            // Generate a token with user ID and role
            const token = jwt.sign(
                { id: user.id, role: user.role }, // Store user id and role in the token
                '789', // Replace '789' with your secret key
                { expiresIn: '1h' } // Token expires in 1 hour
            );

            // Save or update the token in the database
            Token.updateOrInsert(user.username, token, (updateError) => {
                if (updateError) {
                    return res.status(500).json({ message: 'Error saving token' });
                }

                // Return the token as response
                res.json({ token });
            });
        });
    });
};
