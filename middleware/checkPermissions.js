// middleware/usersPermissions.js
const jwt = require('jsonwebtoken');

// تعريف checkPermissions
const checkPermissions = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send("Access denied.");

    jwt.verify(token, '789', (err, user) => {
        if (err) return res.status(403).send("Invalid token.");

        req.user = user;
        console.log("User role:", user.role);
        console.log("Request path:", req.path);
        console.log("Request method:", req.method);
        console.log("User Info:", req.user);

        const userRole = user.role.toLowerCase();

        // تحقق من صلاحيات المستخدم
        if (userRole === 'admin') {
            console.log("Access granted: Admin has full permissions.");
            next();
        } 
        else if (userRole === 'owner') {
           
            if (req.path === '/users') {
                return res.status(403).send("You do not have permission to perform this action.");
            }
            if (req.path === '/list_pricing_rule') {
                next(); 
            }

            // باقي صلاحيات الـ owner
            if (req.method === 'GET' && (req.path === '/Allitems' || req.path.startsWith('/items/') || req.path === '/filter')) {
                next();
            } else if (req.method === 'POST' && req.path === '/additems') {
                next();
            }
            if (req.method === 'POST' && req.path === '/add_pricing_rule') {
                next();
            }
           else if (req.method === 'PUT' && req.path.startsWith('/updateItems/')) {
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
                return res.status(403).send("Access denied: This action is restricted to the owner’s properties only.");
            }
        } else if (userRole === 'user') {
            // صلاحيات الـ user
            if (req.method === 'GET' && (req.path === '/Allitems' || req.path.startsWith('/items/') || req.path === '/filter')) {
                next();
            } else if (req.method === 'GET' && req.path === '/profile') {
                next();
            } else if (req.method === 'PUT' && req.path === '/profile') {
                next();
            } else if (req.method === 'PUT' && req.path.startsWith('/updateBooking/')) {
                next();
            } else if (req.method === 'PUT' && req.path.startsWith('/updateItems/')) {
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
