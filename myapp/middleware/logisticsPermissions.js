const jwt = require('jsonwebtoken');

const logisticsPermissions = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send("Access denied.");

    jwt.verify(token, '789', (err, user) => {
        if (err) return res.status(403).send("Invalid token.");

        req.user = user;

        if (user.role === 'admin' || user.role === 'delivery') {
            next();
        } else {
            return res.status(403).send("You do not have permission to perform this action.");
        }
    });
};

module.exports = logisticsPermissions;