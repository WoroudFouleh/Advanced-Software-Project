// models/Message.js
const db = require('../db'); // استيراد قاعدة البيانات

const Message = {
    sendMessage: (senderUsername, receiverUsername, message, callback) => {
        const querySenderId = 'SELECT id FROM users WHERE username = ?';
        const queryReceiverId = 'SELECT id FROM users WHERE username = ?';

        // استعلام للحصول على معرف المرسل
        db.query(querySenderId, [senderUsername], (err, senderResult) => {
            if (err || senderResult.length === 0) return callback(err || new Error('Sender not found'));

            const senderId = senderResult[0].id;

            // استعلام للحصول على معرف المستلم
            db.query(queryReceiverId, [receiverUsername], (err, receiverResult) => {
                if (err || receiverResult.length === 0) return callback(err || new Error('Receiver not found'));

                const receiverId = receiverResult[0].id;
                const query = 'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)';
                db.query(query, [senderId, receiverId, message], callback);
            });
        });
    },

    getMessages: (userUsername1, userUsername2, callback) => {
        const queryUserId1 = 'SELECT id FROM users WHERE username = ?';
        const queryUserId2 = 'SELECT id FROM users WHERE username = ?';

        // الحصول على معرف المستخدمين
        db.query(queryUserId1, [userUsername1], (err, user1Result) => {
            if (err || user1Result.length === 0) return callback(err || new Error('User 1 not found'));

            const userId1 = user1Result[0].id;

            db.query(queryUserId2, [userUsername2], (err, user2Result) => {
                if (err || user2Result.length === 0) return callback(err || new Error('User 2 not found'));

                const userId2 = user2Result[0].id;
                const query = `
                    SELECT * FROM messages
                    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
                    ORDER BY timestamp ASC
                `;
                db.query(query, [userId1, userId2, userId2, userId1], callback);
            });
        });
    },

    sendReply: (senderUsername, receiverUsername, message, replyToMessageId, callback) => {
        const querySenderId = 'SELECT id FROM users WHERE username = ?';
        const queryReceiverId = 'SELECT id FROM users WHERE username = ?';

        // استعلام للحصول على معرف المرسل
        db.query(querySenderId, [senderUsername], (err, senderResult) => {
            if (err || senderResult.length === 0) return callback(err || new Error('Sender not found'));

            const senderId = senderResult[0].id;

            // استعلام للحصول على معرف المستلم
            db.query(queryReceiverId, [receiverUsername], (err, receiverResult) => {
                if (err || receiverResult.length === 0) return callback(err || new Error('Receiver not found'));

                const receiverId = receiverResult[0].id;
                const query = 'INSERT INTO messages (sender_id, receiver_id, message, reply_to_message_id) VALUES (?, ?, ?, ?)';
                db.query(query, [senderId, receiverId, message, replyToMessageId], callback);
            });
        });
    }
};

module.exports = Message;