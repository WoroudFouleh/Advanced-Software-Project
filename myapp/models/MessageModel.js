// models/Message.js
const db = require('../db'); 

const Message = {
    sendMessage: (senderUsername, receiverUsername, message, callback) => {
        const querySenderId = 'SELECT id FROM users WHERE username = ?';
        const queryReceiverId = 'SELECT id FROM users WHERE username = ?';

        db.query(querySenderId, [senderUsername], (err, senderResult) => {
            if (err || senderResult.length === 0) return callback(err || new Error('Sender not found'));

            const senderId = senderResult[0].id;

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
    
        db.query(queryUserId1, [userUsername1], (err, user1Result) => {
            if (err || user1Result.length === 0) return callback(err || new Error('User 1 not found'));
    
            const userId1 = user1Result[0].id;
    
            db.query(queryUserId2, [userUsername2], (err, user2Result) => {
                if (err || user2Result.length === 0) return callback(err || new Error('User 2 not found'));
    
                const userId2 = user2Result[0].id;
                const query = `
                    SELECT m.id, m.message, m.timestamp, m.reply_to_message_id, 
                           sender.username AS sender_username, 
                           receiver.username AS receiver_username
                    FROM messages m
                    JOIN users sender ON m.sender_id = sender.id
                    JOIN users receiver ON m.receiver_id = receiver.id
                    WHERE (m.sender_id = ? AND m.receiver_id = ?) 
                       OR (m.sender_id = ? AND m.receiver_id = ?)
                    ORDER BY m.timestamp ASC
                `;
    
                db.query(query, [userId1, userId2, userId2, userId1], (err, results) => {
                    if (err) return callback(err);
    
                    const filteredResults = results.map(message => {
                        if (message.reply_to_message_id === null) {
                            const { reply_to_message_id, ...rest } = message;
                            return rest; 
                        }
                        return message; 
                    });
    
                    callback(null, filteredResults);
                });
            });
        });
    },
    
    sendReply: (senderUsername, receiverUsername, message, replyToMessageId, callback) => {
        const querySenderId = 'SELECT id FROM users WHERE username = ?';
        const queryReceiverId = 'SELECT id FROM users WHERE username = ?';

        db.query(querySenderId, [senderUsername], (err, senderResult) => {
            if (err || senderResult.length === 0) return callback(err || new Error('Sender not found'));

            const senderId = senderResult[0].id;

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