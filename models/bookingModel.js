const db = require("../db");

const Booking = {
    create: (bookingData, callback) => {
        const { item_id, user_id, start_date, end_date, total_price } = bookingData;

        const query = `
            INSERT INTO bookings (item_id, user_id, start_date, end_date, total_price)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.execute(query, [item_id, user_id, start_date, end_date, total_price], (error, result) => {
            if (error) return callback(error);
            callback(null, result);
        });
    },

    getAll: (callback) => {
        const query = 'SELECT * FROM bookings';
        db.execute(query, (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    },

    getById: (id, callback) => {
        const query = 'SELECT * FROM bookings WHERE id = ?';
        db.execute(query, [id], (error, results) => {
            if (error) return callback(error);
            callback(null, results[0]);
        });
    },

    update: (id, bookingData, callback) => {
        const { status } = bookingData;

        const query = `
            UPDATE bookings
            SET status = ?
            WHERE id = ?
        `;

        db.execute(query, [status, id], (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    },

    delete: (id, callback) => {
        const query = 'DELETE FROM bookings WHERE id = ?';
        db.execute(query, [id], (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    },
};

module.exports = Booking;
