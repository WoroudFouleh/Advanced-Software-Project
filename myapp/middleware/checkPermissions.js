// middleware/checkPermissions.js
const jwt = require('jsonwebtoken');

const checkPermissions = (req, res, next) => {
    // استخراج التوكن مباشرة من الهيدر
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send("Access denied.");

    jwt.verify(token,'789', (err, user) => {
        if (err) return res.status(403).send("Invalid token.");
        
        req.user = user; // حفظ معلومات المستخدم في req

        // تحقق من صلاحيات المستخدم
        if (user.role === 'admin' || user.role === 'owner') {
            // إذا كان المستخدم Admin أو Owner، يسمح له باستخدام جميع الصلاحيات
            next();
        } else if (user.role === 'user') {
            // إذا كان المستخدم فقط User، يسمح له بعرض العناصر وتصفية
            if (req.method === 'GET' && (req.path === '/Allitems' || req.path.startsWith('/items/') || req.path === '/filter')) {
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
