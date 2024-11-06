const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');

router.get('/:notificationId', notificationsController.getNotificationById); 

router.get('/all/:userId', notificationsController.getAllNotifications);

module.exports = router;