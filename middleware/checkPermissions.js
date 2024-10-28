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

        console.log("Path:", req.path); // يعرض المسار في وحدة التحكم
    console.log("User Role:", req.user.role); // يعرض الدور للتحقق منه
    
    if (req.path === '/messages/sendReply') {
        return next();
    }
        // تحقق من صلاحيات المستخدم
        if (user.role === 'admin') {
            if (req.path.startsWith('/messages')) {
                return res.status(403).send("Admin does not have access to messages.");
            }
            else{
                next();
            }
        } else if (user.role === 'owner') {
            // صلاحيات الـ owner
            if (req.path.startsWith('/messages')&& req.method === 'POST' ) {
                const { receiverRole } = req.body;
                if (receiverRole === 'user') {
                    return next();
                }
                return res.status(403).send("You can only message users.");
            }
            

            if (req.path.startsWith('/messages')&& req.method === 'GET' ) {
                
                    return next();
                
            }
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
            }
             else if (req.method === 'POST' && req.path === '/additems') {
                next();
            } else if (req.method === 'PUT' && req.path.startsWith('/updateItems/')) {
                next();
            } 
            else if (req.method === 'PUT' && req.path.startsWith('/updateBooking/')) {
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
            if (req.path.startsWith('/messages/send') && req.method === 'POST') {
                const { receiverRole } = req.body;
                if (receiverRole === 'owner' || receiverRole === 'delivery') {
                    return next();
                }
                return res.status(403).send("You can only message owners or delivery.");
            }
            

            if (req.path.startsWith('/messages') && req.method === 'GET') {
                
                    return next();
                
            }
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
        } else if(user.role === 'delivery'){
             // صلاحيات الـ user
             if (req.path.startsWith('/messages/send') && req.method === 'POST') {
                const { receiverRole } = req.body;
                if (receiverRole === 'user' ) {
                    return next();
                }
                return res.status(403).send("You can only message users.");
            }
            

            if (req.path.startsWith('/messages') && req.method === 'GET') {
                
                    return next();
                
            }
        }
        
        else {
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
            }
            else if (req.method === 'POST' && req.path.startsWith('/addBooking/')) {
                next();
            } else if (req.method === 'PUT' && req.path.startsWith('/updateItems/')) {
                next();
            }  else if (req.method === 'DELETE' && req.path.startsWith('/deleteBooking/')) {
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
*/