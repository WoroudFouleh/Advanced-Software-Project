// middleware/checkPermissions.js
const jwt = require('jsonwebtoken');

const usersPermissions = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send("Access denied.");

    jwt.verify(token, '789', (err, user) => {
        if (err) return res.status(403).send("Invalid token.");

        req.user = user;

        // تحقق من صلاحيات المستخدم
        if (user.role === 'admin' || user.role === 'owner') {
            next(); // Admin أو Owner يمكنه استخدام جميع الصلاحيات
        } else if (user.role === 'user') {
            if (req.method === 'GET' && (req.path === '/profile')) {
                next(); // للمستخدم العادي، يمكنه عرض ملفه الشخصي
            } else if (req.method === 'PUT' && req.path === '/profile') {
                next(); // للمستخدم العادي، يمكنه تعديل ملفه الشخصي
            } else if (req.method === 'DELETE' && req.path === '/profile') {
                next(); // للمستخدم العادي، يمكنه حذف حسابه
            } else {
                return res.status(403).send("You do not have permission to perform this action.");
            }
        } else {
            return res.status(403).send("Invalid role.");
        }
    });
};

module.exports = checkPermissions;