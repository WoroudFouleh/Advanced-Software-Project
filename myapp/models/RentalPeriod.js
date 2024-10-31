const db = require("../db");

const rentalPeriod = {
    create: (rentalPeriodData, callback) => {
        const { item_id, rental_duration_days, rental_price } = rentalPeriodData;

        if (item_id === undefined || rental_duration_days === undefined || rental_price === undefined) {
            return callback(new Error("All fields are required."));
        }

        const query = `
            INSERT INTO rental_periods (item_id, rental_duration_days, rental_price)
            VALUES (?, ?, ?)
        `;

        db.execute(query, [item_id, rental_duration_days, rental_price], (error, result) => {
            if (error) return callback(error);
            callback(null, result);
        });
    },

    getAll: (callback) => {
        const query = 'SELECT * FROM rental_periods';
        db.execute(query, (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    },

    getById: (id, callback) => {
        const query = 'SELECT * FROM rental_periods WHERE id = ?';
        db.execute(query, [id], (error, results) => {
            if (error) return callback(error);
            callback(null, results[0]);
        });
    },

    update: (id, rentalPeriodData, callback) => {
        const { item_id, rental_duration_days, rental_price } = rentalPeriodData;

        const query = `
            UPDATE rental_periods
            SET item_id = ?, rental_duration_days = ?, rental_price = ?
            WHERE id = ?
        `;

        db.execute(query, [item_id, rental_duration_days, rental_price, id], (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    },

    delete: (id, callback) => {
        const query = 'DELETE FROM rental_periods WHERE id = ?';
        db.execute(query, [id], (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    },
};

module.exports = rentalPeriod;
