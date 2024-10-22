const jwt = require('jsonwebtoken');
const db = require('../db');

// تعريف checkPermissions
const checkPermissions = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send("Access denied.");

    jwt.verify(token, '789', (err, user) => {
        if (err) return res.status(403).send("Invalid token.");

        req.user = user;

        // تحقق من صلاحيات المستخدم
        if (user.role === 'admin') {
            // يسمح للمستخدم Admin بجميع العمليات
            return next();
        } else if (user.role === 'owner') {
            // تحقق إذا كان الـ owner يحاول إضافة أو تعديل أو حذف فترة إيجار
            if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
                const itemId = req.body.item_id || req.params.item_id || req.params.id; // تحديد معرف العنصر

                const query = 'SELECT owner_id FROM items WHERE id = ?';
                db.execute(query, [itemId], (error, results) => {
                    if (error) return res.status(500).send("Database error.");
                    if (results.length === 0 || results[0].owner_id !== user.id) {
                        return res.status(403).send("You do not have permission to modify rental periods for this item.");
                    }
                    return next();
                });
            } else {
                // صلاحيات الـ owner للعمليات الأخرى
                if (req.path === '/users') {
                    return res.status(403).send("You do not have permission to view users.");
                } else if (req.method === 'GET' && (req.path === '/Allitems' || req.path.startsWith('/items/') || req.path === '/filter')) {
                    return next();
                } else if (req.method === 'POST' && req.path === '/additems') {
                    return next();
                } else if (req.method === 'PUT' && req.path.startsWith('/updateItems/')) {
                    return next();
                } else if (req.method === 'DELETE' && req.path.startsWith('/deleteitems/')) {
                    return next();
                } else if (req.method === 'GET' && req.path === '/profile') {
                    return next();
                } else if (req.method === 'PUT' && req.path === '/profile') {
                    return next();
                } else if (req.method === 'DELETE' && req.path === '/profile') {
                    return next();
                } else {
                    return res.status(403).send("You do not have permission to perform this action.");
                }
            }
        } else if (user.role === 'user') {
            // صلاحيات الـ user
            if (req.method === 'GET' && (req.path === '/Allitems' || req.path.startsWith('/items/') || req.path === '/filter')) {
                return next();
            } else if (req.method === 'GET' && req.path === '/profile') {
                return next();
            } else if (req.method === 'PUT' && req.path === '/profile') {
                return next();
            } else if (req.method === 'DELETE' && req.path === '/profile') {
                return next();
            } else {
                return res.status(403).send("You do not have permission to perform this action.");
            }
        } else {
            return res.status(403).send("Invalid role.");
        }
    });
};

module.exports = checkPermissions;

/*// middleware/usersPermissions.js
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

module.exports = checkPermissions;*/