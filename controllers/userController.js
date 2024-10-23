exports.addUser = (req, res) => {
    const { username, email, password, role } = req.body;

    // تحقق من أن الحقول الأساسية موجودة
    if (!username || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // تشفير كلمة المرور
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ message: 'Error hashing password' });
        }

        // إضافة المستخدم مع البريد الإلكتروني
        User.create(username, email, hashedPassword, role, (error) => {
            if (error) {
                console.error('Error creating user:', error);
                return res.status(500).json({ message: 'Error creating user' });
            }
            res.status(201).json({ message: 'User created successfully' });
        });
    });
};
