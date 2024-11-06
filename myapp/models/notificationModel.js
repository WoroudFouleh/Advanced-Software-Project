// notificationModel.js

const db = require("../db");

const getNotificationsByUserId = (userId, callback) => {
    const query = `
        SELECT * FROM notifications WHERE user_id = ?
    `;

    db.execute(query, [userId], (error, results) => {
        if (error) {
            return callback(error);
        }
        callback(null, results);
    });
};

const getNotificationById = (notificationId, callback) => {
    const query = `
        SELECT * FROM notifications WHERE id = ?
    `;

    db.execute(query, [notificationId], (error, result) => {
        if (error) {
            return callback(error);
        }
        callback(null, result[0]); 
    });
};

module.exports = { getNotificationsByUserId, getNotificationById }; 