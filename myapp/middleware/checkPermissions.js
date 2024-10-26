const jwt = require('jsonwebtoken');

// تعريف checkPermissions
const checkPermissions = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        console.log("No token provided."); // إضافة رسالة تفيد بعدم وجود توكن
        return res.status(403).send("Access denied.");
    }

    // إزالة كلمة "Bearer " إذا كانت موجودة
    const tokenWithoutBearer = token.startsWith('Bearer ') ? token.slice(7) : token; // تأكد من تعريف المتغير هنا

    jwt.verify(tokenWithoutBearer, '789', (err, user) => {
        if (err) {
            console.log("Invalid token."); // إضافة رسالة تفيد بأن التوكن غير صحيح
            return res.status(403).send("Invalid token.");
        }

        console.log(user); // إضافة هذا السطر للتحقق من بيانات المستخدم
        req.user = user;

        // تحقق من صلاحيات المستخدم
        if (user.role === 'admin') {
            next();
        } else if (user.role === 'owner') {
            // صلاحيات الـ owner
            if (req.path.startsWith('/api/user-points-history')) {
                return res.status(403).send("You do not have permission to access statistics.");
            }
            if (req.path === '/users') {
                return res.status(403).send("You do not have permission to view users.");
            }
            if (req.path.startsWith('/api/statistics')) {
                return res.status(403).send("You do not have permission to access statistics.");
            }
            if (req.path.startsWith('/api/discount-levels')) {
                return res.status(403).send("You do not have permission to access statistics.");
            }
            if (req.method === 'GET' && (req.path === '/Allitems' || req.path.startsWith('/items/') || req.path === '/filter')) {
                next();
            } else if (req.method === 'POST' && req.path === '/additems') {
                next();
            } else if (req.method === 'PUT' && req.path.startsWith('/updateItems/')) {
                next();
            } else if (req.method === 'PUT' && req.path.startsWith('/updateBooking/')) {
                next();
            } else if (req.method === 'DELETE' && req.path.startsWith('/deleteitems/')) {
                next();
            } else if (req.method === 'GET' && req.path === '/profile') {
                next();
            } else if (req.method === 'GET' && req.path === '/getAllBookings') {
                next();
            } else if (req.method === 'GET' && req.path.startsWith('/getBookingById/')) {
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
            if (req.path.startsWith('/api/user-points-history')) {
                next();
            }
            if (req.path.startsWith('/api/statistics')) {
                return res.status(403).send("You do not have permission to access statistics.");
            }
            if (req.path.startsWith('/api/discount-levels')) {
                return res.status(403).send("You do not have permission to access statistics.");
            }
            if (req.method === 'GET' && (req.path === '/Allitems' || req.path.startsWith('/items/') || req.path === '/filter')) {
                next();
            } else if (req.method === 'GET' && req.path === '/profile') {
                next();
            } else if (req.method === 'PUT' && req.path === '/profile') {
                next();
            } else if (req.method === 'PUT' && req.path.startsWith('/updateBooking/')) {
                next();
            } else if (req.method === 'POST' && req.path === '/addBooking') {
                next();
            } else if (req.method === 'DELETE' && req.path.startsWith('/deleteBooking/')) {
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