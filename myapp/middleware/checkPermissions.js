const jwt = require('jsonwebtoken');

//checkPermissions
const checkPermissions = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        console.log("No token provided."); 
        return res.status(403).send("Access denied.");
    }

    const tokenWithoutBearer = token.startsWith('Bearer ') ? token.slice(7) : token; 

    jwt.verify(tokenWithoutBearer, '789', (err, user) => {
        if (err) {
            console.log("Invalid token."); 
            return res.status(403).send("Invalid token.");
        }

        console.log(user); 
        req.user = user;

        console.log("Path:", req.path); 
    console.log("User Role:", req.user.role); 
    
    if (req.path === '/messages/sendReply') {
        return next();
    }
        if (user.role === 'admin') {
            if (req.path.startsWith('/messages')) {
                return res.status(403).send("Admin does not have access to messages.");
            }
            else if (req.method === 'DELETE' && req.path.startsWith('/deleteitems/')) {
                next();
            }
            else{
                next();
            }
        } else if (user.role === 'owner') {
            if (req.method === 'POST' && req.path === '/add_pricing_rule') {
                next();
            }
            if (req.method === 'GET' && req.path === '/list_pricing_rules') {
                next();
            }
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
            } else if (req.method === 'GET' && req.path === '/getRatingsByItemId') {
                next();
            } 
            else {
                return res.status(403).send("You do not have permission to perform this action.");
            }
        } else if (user.role === 'user') {
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
            if (req.path.startsWith('/user-points-history')) {
                next();
            }
            if (req.path.startsWith('/api/statistics')) {
                return res.status(403).send("You do not have permission to access statistics.");
            }
            if (req.path.startsWith('/api/discount-levels')) {
                return res.status(403).send("You do not have permission to access discount-levels.");
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
            } else if (req.method === 'POST' && req.path === '/Review') {
                next();
            }else if (req.method === 'DELETE' && req.path === '/deletereview') {
                next();
            }
            else if (req.method === 'PUT' && req.path === '/updatereview') {
                next();
            }else if (req.method === 'GET' && req.path === '/getRatingsByItemId') {
                next();
            }
            else {
                return res.status(403).send("You do not have permission to perform this action.");
            }
        } else if(user.role === 'delivery'){
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
