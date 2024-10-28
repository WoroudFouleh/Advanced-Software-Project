const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');

// route للحصول على إشعار واحد بناءً على ID
router.get('/:notificationId', notificationsController.getNotificationById); 

// route للحصول على جميع الإشعارات للمستخدم
router.get('/all/:userId', notificationsController.getAllNotifications);

module.exports = router;
