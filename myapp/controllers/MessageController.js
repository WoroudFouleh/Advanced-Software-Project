// controllers/messageController.js
const Message = require('../models/MessageModel');

exports.sendMessage = (req, res) => {
    const { receiverUsername, message } = req.body; 
    const senderUsername = req.user.username; 

    Message.sendMessage(senderUsername, receiverUsername, message, (error) => {
        if (error) return res.status(500).json({ message: 'Error sending message' });
        res.status(201).json({ message: 'Message sent successfully' });
    });
};

exports.getMessages = (req, res) => {
    const userUsername1 = req.user.username; 
    const userUsername2 = req.params.receiverUsername; 

    Message.getMessages(userUsername1, userUsername2, (error, results) => {
        if (error) return res.status(500).json({ message: 'Error fetching messages' });

        const filteredResults = results.map(message => {
            if (message.reply_to_message_id === null) {
                const { reply_to_message_id, ...rest } = message; 
                return rest; 
            }
            return message;
        });

        res.json(filteredResults);
    });
};

exports.sendReply = (req, res) => {
    const { receiverUsername, message, replyToMessageId } = req.body; 
    const senderUsername = req.user.username; 

    Message.sendReply(senderUsername, receiverUsername, message, replyToMessageId, (error) => {
        if (error) return res.status(500).json({ message: 'Error sending reply' });
        res.status(201).json({ message: 'Reply sent successfully' });
    });
};