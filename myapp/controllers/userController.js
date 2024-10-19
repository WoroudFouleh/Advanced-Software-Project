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
exports.addUser = (req, res) => {
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

    // قم بإنشاء مصفوفة لحفظ القيم التي سيتم تحديثها
    const fields = [];
    const values = [];

    if (username) {
        fields.push('username = ?');
        values.push(username);
    }

    if (password) {
        const hashedPassword = bcrypt.hashSync(password, 10); // تشفير كلمة المرور إذا تم تعديلها
        fields.push('password = ?');
        values.push(hashedPassword);
    }

    if (fields.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
    }

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    values.push(userId); // أضف الـ userId كآخر قيمة

    User.update(query, values, (error) => {
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

    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.id; // معرف المستخدم من التوكن

    User.findById(userId, (error, results) => {
        if (error || results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(results[0]);
    });
};


exports.updateOwnProfile = (req, res) => {
    const userId = req.user.id; // معرف المستخدم من التوكن
    const { username, password, role } = req.body; // احصل على الحقول من الطلب

    // إعداد كائن لتخزين التحديثات
    const updates = {};

    // تحقق من وجود username في الطلب وأضفه إلى updates
    if (username) {
        updates.username = username;
    }
    
    // تحقق من وجود password في الطلب وقم بتشفيره
    if (password) {
        updates.password = bcrypt.hashSync(password, 10);
    }

    // تحقق من وجود role في الطلب وأضفه إلى updates
    if (role) {
        updates.role = role; // السماح بتحديث الدور
    }

    // تحديث المستخدم في قاعدة البيانات
    User.update2(userId, updates, (error) => {
        if (error) {
            console.error('Error updating user:', error); // طباعة الخطأ في التيرمنال
            return res.status(500).json({ message: 'Error updating user' });
        }
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
