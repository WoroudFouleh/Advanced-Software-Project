// middleware/usersPermissions.js
const jwt = require('jsonwebtoken');

// تعريف checkPermissions
const checkPermissions = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send("Access denied.");

    jwt.verify(token, '789', (err, user) => {
        if (err) return res.status(403).send("Invalid token.");

        req.user = user;

       
        // تحقق من صلاحيات المستخدم
        if (user.role === 'admin') {
            // إذا كان المستخدم Admin، يسمح له بجميع العمليات
            next();
        } else if (user.role === 'owner') {
            // صلاحيات الـ owner
            if (req.path === '/users') {
                // منع الأونر من الوصول إلى /users
                return res.status(403).send("You do not have permission to view users.");
            }
            // باقي صلاحيات الـ owner
            if (req.method === 'GET' && (req.path === '/Allitems' || req.path.startsWith('/items/') || req.path === '/filter')) {
                next();
            } else if (req.method === 'POST' && req.path === '/additems') {
                next();
            } else if (req.method === 'PUT' && req.path.startsWith('/updateItems/')) {
                next();
            } else if (req.method === 'DELETE' && req.path.startsWith('/deleteitems/')) {
                next();
            } else if (req.method === 'GET' && req.path === '/profile') {
                next();
            } else if (req.method === 'PUT' && req.path === '/profile') {
                next();
            } else if (req.method === 'DELETE' && req.path === '/profile') {
                next();
            } else {
                return res.status(403).send("You do not have permission to perform this action.");
            }
        } else if (user.role === 'user') {
            // صلاحيات الـ user
            if (req.method === 'GET' && (req.path === '/Allitems' || req.path.startsWith('/items/') || req.path === '/filter')) {
                next();
            } else if (req.method === 'GET' && req.path === '/profile') {
                next();
            } else if (req.method === 'PUT' && req.path === '/profile') {
                next();
            } else if (req.method === 'DELETE' && req.path === '/profile') {
                next();
            } else {
                return res.status(403).send("You do not have permission to perform this action.");
            }
        } else {
            return res.status(403).send("Invalid role.");
        }
    });
};

module.exports = checkPermissions;