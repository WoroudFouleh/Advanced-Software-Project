// notificationsController.js

const { getNotificationsByUserId, getNotificationById } = require('../models/notificationModel');

// دالة للحصول على جميع الإشعارات للمستخدم
const getAllNotifications = (req, res) => {
    const userId = req.params.userId;

    getNotificationsByUserId(userId, (error, results) => {
        if (error) return res.status(500).send("Error retrieving notifications.");
        res.status(200).json(results);
    });
};

// دالة للحصول على إشعار واحد بناءً على ID
const getNotificationByIdHandler = (req, res) => {
    const notificationId = req.params.notificationId;

    getNotificationById(notificationId, (error, result) => {
        if (error) return res.status(500).send("Error retrieving notification.");
        if (!result) return res.status(404).send("Notification not found.");
        res.status(200).json(result);
    });
};

module.exports = { getAllNotifications, getNotificationById: getNotificationByIdHandler };
