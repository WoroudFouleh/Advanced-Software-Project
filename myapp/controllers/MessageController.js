// controllers/messageController.js
const Message = require('../models/MessageModel');

exports.sendMessage = (req, res) => {
    const { receiverUsername, message } = req.body; // تغيير هنا
    const senderUsername = req.user.username; // استخرج اسم المستخدم من الطلب

    Message.sendMessage(senderUsername, receiverUsername, message, (error) => {
        if (error) return res.status(500).json({ message: 'Error sending message' });
        res.status(201).json({ message: 'Message sent successfully' });
    });
};

exports.getMessages = (req, res) => {
    const userUsername1 = req.user.username; // اسم المستخدم للمرسل
    const userUsername2 = req.params.receiverUsername; // اسم المستخدم للمستلم

    Message.getMessages(userUsername1, userUsername2, (error, results) => {
        if (error) return res.status(500).json({ message: 'Error fetching messages' });

        // تنقيح النتائج لحذف reply_to_message_id إذا كانت null
        const filteredResults = results.map(message => {
            if (message.reply_to_message_id === null) {
                const { reply_to_message_id, ...rest } = message; // إزالة reply_to_message_id
                return rest; // إعادة الكائن بدون reply_to_message_id
            }
            return message; // إعادة الكائن كما هو إذا كانت القيمة غير null
        });

        res.json(filteredResults);
    });
};

exports.sendReply = (req, res) => {
    const { receiverUsername, message, replyToMessageId } = req.body; // تغيير هنا
    const senderUsername = req.user.username; // استخرج اسم المستخدم من الطلب

    Message.sendReply(senderUsername, receiverUsername, message, replyToMessageId, (error) => {
        if (error) return res.status(500).json({ message: 'Error sending reply' });
        res.status(201).json({ message: 'Reply sent successfully' });
    });
};