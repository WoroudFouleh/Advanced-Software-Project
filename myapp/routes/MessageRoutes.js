// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/MessageController');  // Adjust the path as needed
const checkPermissions = require('../middleware/checkPermissions');

// Route to send a message
router.post('/messages/send', checkPermissions, MessageController.sendMessage);

// Route to get messages between two users
router.get('/messages/:receiverUsername', checkPermissions, MessageController.getMessages);
router.post('/messages/sendReply', checkPermissions, MessageController.sendReply);

module.exports = router;
