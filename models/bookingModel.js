const db = require('../db');

const Booking = {
    create: (bookingData, callback) => {
        const { user_id, item_id, rental_period_id, start_date, end_date, username } = bookingData;

        if (user_id === undefined || item_id === undefined || rental_period_id === undefined || !start_date || !end_date || !username) {
            return callback(new Error("All fields are required."));
        }

        const query = `
            INSERT INTO bookings (user_id, item_id, rental_period_id, start_date, end_date, username)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.connection.execute(query, [user_id, item_id, rental_period_id, start_date, end_date, username], (error, result) => {
            if (error) return callback(error);
            callback(null, result);
        });
    },

    getAll: (callback) => {
        const query = 'SELECT * FROM bookings';
        db.connection.execute(query, (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    },

    getById: (id, callback) => {
        const query = 'SELECT * FROM bookings WHERE id = ?';
        db.connection.execute(query, [id], (error, results) => {
            if (error) return callback(error);
            callback(null, results[0]);
        });
    },

    update: (id, bookingData, callback) => {
        const { user_id, item_id, rental_period_id, start_date, end_date, username } = bookingData;

        const query = `
            UPDATE bookings
            SET user_id = ?, item_id = ?, rental_period_id = ?, start_date = ?, end_date = ?, username = ?
            WHERE id = ?
        `;

        db.connection.execute(query, [user_id, item_id, rental_period_id, start_date, end_date, username, id], (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    },

    delete: (id, callback) => {
        const query = 'DELETE FROM bookings WHERE id = ?';
        db.connection.execute(query, [id], (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    },
};

module.exports = Booking;
