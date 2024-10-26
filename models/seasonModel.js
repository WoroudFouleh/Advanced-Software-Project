// models/seasonModel.js
const db = require("../db");

const seasons = {
    create: (seasonData, callback) => {
        const { name, start_date, end_date } = seasonData;

        const query = `
            INSERT INTO seasons (name, start_date, end_date)
            VALUES (?, ?, ?)
        `;

        db.execute(query, [name, start_date, end_date], (error, result) => {
            if (error) return callback(error);
            callback(null, result);
        });
    },

    getAll: (callback) => {
        const query = 'SELECT * FROM seasons';
        db.execute(query, (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    },

    update: (id, seasonData, callback) => {
        const { name, start_date, end_date } = seasonData;

        const query = `
            UPDATE seasons
            SET name = ?, start_date = ?, end_date = ?
            WHERE id = ?
        `;

        db.execute(query, [name, start_date, end_date, id], (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    },

    delete: (id, callback) => {
        const query = 'DELETE FROM seasons WHERE id = ?';
        db.execute(query, [id], (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    }
};

module.exports = seasons;
