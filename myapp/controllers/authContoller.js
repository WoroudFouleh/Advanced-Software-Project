const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Token = require('../models/tokenModel'); // تأكد من مسار النموذج الصحيح

// تسجيل مستخدم جديد
exports.register = (req, res) => {
    const { username, password, role } = req.body;
    
    // تشفير كلمة المرور
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ message: 'Error hashing password' });

        User.create(username, hashedPassword, role, (error, result) => {
            if (error) return res.status(500).json({ message: 'Error creating user' });
            res.status(201).json({ message: 'User registered successfully' });
        });
    });
};
// تسجيل الدخول
exports.login = (req, res) => {
    const { username, password } = req.body;

    User.findByUsername(username, (error, results) => {
        if (error || results.length === 0) return res.status(401).json({ message: 'Invalid username or password' });

        const user = results[0];

        // التحقق من كلمة المرور
        bcrypt.compare(password, user.password, (err, match) => {
            if (err || !match) return res.status(401).json({ message: 'Invalid username or password' });

            // إنشاء توكن مع بيانات المستخدم
            const token = jwt.sign({ id: user.id, role: user.role }, '789', { expiresIn: '1h' });
            
            // تخزين التوكن في قاعدة البيانات
            Token.saveToken(user.username, token, (saveError) => {
                if (saveError) return res.status(500).json({ message: 'Error saving token' });

                res.json({ token });
            });
        });
    });
};
