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
        if (error) return res.status(500).json({ message: 'Error deleting user' });
        res.json({ message: 'User deleted successfully' });
    });
};
/*exports.addUser = (req, res) => {
    const { username, password, role } = req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ message: 'Error hashing password' });

        User.create(username, hashedPassword, role, (error) => {
            if (error) return res.status(500).json({ message: 'Error creating user' });
            res.status(201).json({ message: 'User created successfully' });
        });
    });
};

exports.updateUser = (req, res) => {
    const userId = req.params.id;
    const { username, password } = req.body;

    let hashedPassword = password;
    if (password) {
        hashedPassword = bcrypt.hashSync(password, 10); // تشفير كلمة المرور إذا تم تعديلها
    }

    User.updateById(userId, username, hashedPassword, (error) => {
        if (error) return res.status(500).json({ message: 'Error updating user' });
        res.json({ message: 'User updated successfully' });
    });
};



exports.searchUser = (req, res) => {
    const { searchTerm } = req.query; // الاسم أو الدور

    User.findByRoleOrUsername(searchTerm, (error, results) => {
        if (error) return res.status(500).json({ message: 'Error fetching users' });
        res.json(results);
    });
};

exports.getOwnProfile = (req, res) => {
    const userId = req.user.id; // معرف المستخدم من التوكن

    User.findById(userId, (error, results) => {
        if (error || results.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(results[0]); // عرض معلومات المستخدم
    });
};

exports.updateOwnProfile = (req, res) => {
    const userId = req.user.id; // معرف المستخدم من التوكن
    const { username, password } = req.body;

    let hashedPassword = password;
    if (password) {
        hashedPassword = bcrypt.hashSync(password, 10); // تشفير كلمة المرور إذا تم تعديلها
    }

    User.updateById(userId, username, hashedPassword, (error) => {
        if (error) return res.status(500).json({ message: 'Error updating user' });
        res.json({ message: 'User updated successfully' });
    });
};

exports.deleteOwnAccount = (req, res) => {
    const userId = req.user.id; // معرف المستخدم من التوكن

    User.deleteById(userId, (error) => {
        if (error) return res.status(500).json({ message: 'Error deleting user' });
        res.json({ message: 'Account deleted successfully' });
    });
};
*/