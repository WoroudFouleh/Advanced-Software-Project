// controllers/userController.js
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

exports.getAllUsers = (req, res) => {
    User.findAll((error, results) => {
        if (error) return res.status(500).json({ message: 'Error fetching users' });
        res.json(results);
    });
};

exports.deleteUser = (req, res) => {
    const userId = req.params.id;

    User.deleteById(userId, (error) => {
        if (error) {
            console.error("Error deleting user:", error);
            return res.status(500).json({ message: 'Error deleting user' });
        }
        res.json({ message: 'User deleted successfully' });
    });
};

exports.addUser = (req, res) => {
    const { username, password, email, role } = req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ message: 'Error hashing password' });

        User.create(username, hashedPassword, email, role, (error) => {
            if (error) return res.status(500).json({ message: 'Error creating user' });
            res.status(201).json({ message: 'User created successfully' });
        });
    });
};

exports.updateUser = (req, res) => {
    const userId = req.params.id;
    const { username, password, role, email} = req.body;

    const fields = [];
    const values = [];

    if (username) {
        fields.push('username = ?');
        values.push(username);
    }

    if (password) {
        const hashedPassword = bcrypt.hashSync(password, 10); 
        fields.push('password = ?');
        values.push(hashedPassword);
    }
    if (role) {
        fields.push('role = ?');
        values.push(role);
    }
    if (email) {
        fields.push('email = ?');
        values.push(email);
    }   
    if (fields.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
    }

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    values.push(userId);

    User.update(query, values, (error) => {
        if (error) return res.status(500).json({ message: 'Error updating user' });
        res.json({ message: 'User updated successfully' });
    });
};




exports.searchUser = (req, res) => {
    const { searchTerm } = req.query; 

    User.findByRoleOrUsername(searchTerm, (error, results) => {
        if (error) return res.status(500).json({ message: 'Error fetching users' });
        res.json(results);
    });
};

exports.getOwnProfile = (req, res) => {

    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.id; 

    User.findById(userId, (error, results) => {
        if (error || results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(results[0]);
    });
};


exports.updateOwnProfile = (req, res) => {
    const userId = req.user.id; 
    const { username, password, role } = req.body; 

    const updates = {};

    if (username) {
        updates.username = username;
    }
    
    if (password) {
        updates.password = bcrypt.hashSync(password, 10);
    }

    if (role) {
        updates.role = role; 
    }

    User.update2(userId, updates, (error) => {
        if (error) {
            console.error('Error updating user:', error); 
            return res.status(500).json({ message: 'Error updating user' });
        }
        res.json({ message: 'User updated successfully' });
    });
};



exports.deleteOwnAccount = (req, res) => {
    const userId = req.user.id; 

    User.deleteById(userId, (error) => {
        if (error) return res.status(500).json({ message: 'Error deleting user' });
        res.json({ message: 'Account deleted successfully' });
    });
};

exports.getUserRolePercentages = (req, res) => {
    User.getRoleCounts((error, results) => {
        if (error) {
            console.error('Error fetching role counts:', error);
            return res.status(500).json({ message: 'Error fetching role counts' });
        }

        const total = results.total;
        const adminPercentage = (results.admin / total) * 100;
        const ownerPercentage = (results.owner / total) * 100;
        const regularUserPercentage = (results.regularUser / total) * 100;
        const deliveryPercentage = (results.delivery / total) * 100;

        res.json({
            total,
            adminPercentage,
            ownerPercentage,
            regularUserPercentage,
            deliveryPercentage
        });
    });
};