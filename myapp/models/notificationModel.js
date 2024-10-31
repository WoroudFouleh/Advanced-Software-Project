// notificationModel.js

const db = require("../db");

// دالة للحصول على الإشعارات بناءً على معرف المستخدم
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

// دالة للحصول على إشعار واحد بناءً على ID
const getNotificationById = (notificationId, callback) => {
    const query = `
        SELECT * FROM notifications WHERE id = ?
    `;

    db.execute(query, [notificationId], (error, result) => {
        if (error) {
            return callback(error);
        }
        callback(null, result[0]); // نفترض أن النتيجة عبارة عن مصفوفة
    });
};

module.exports = { getNotificationsByUserId, getNotificationById }; // تأكد من تصدير الدوال