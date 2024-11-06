// userPointsHistoryModel.js
const db = require('../db'); 

const UserPointsHistory = {
    getUserPointsHistory: (userId, callback) => {
        const query = 'SELECT * FROM user_points_history WHERE user_id = ?';
        db.execute(query, [userId], callback);
    },
    addUserPointsHistory: (data, callback) => {
        const { user_id, booking_id, points_earned, timestamp } = data;
        const query = 'INSERT INTO user_points_history (user_id, booking_id, points_earned, timestamp) VALUES (?, ?, ?, ?)';
        db.execute(query, [user_id, booking_id, points_earned, timestamp], callback);
    },
    updateUserPointsHistory: (id, data, callback) => {
        const { booking_id, points_earned, timestamp } = data;
        const query = `
            UPDATE user_points_history
            SET 
                booking_id = COALESCE(?, booking_id),
                points_earned = COALESCE(?, points_earned),
                timestamp = COALESCE(?, timestamp)
            WHERE id = ?`;
        db.execute(query, [booking_id, points_earned, timestamp, id], callback);
    },
    deleteUserPointsHistory: (id, callback) => {
        const query = 'DELETE FROM user_points_history WHERE id = ?';
        db.execute(query, [id], callback);
    }
};

module.exports = UserPointsHistory;
