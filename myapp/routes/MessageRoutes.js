// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/MessageController'); 
const checkPermissions = require('../middleware/checkPermissions');

router.post('/messages/send', checkPermissions, MessageController.sendMessage);

router.get('/messages/:receiverUsername', checkPermissions, MessageController.getMessages);
router.post('/messages/sendReply', checkPermissions, MessageController.sendReply);

module.exports = router;
