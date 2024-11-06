const mysql = require('mysql2');

const db = require('../db'); 


exports.updateOrInsert = (username, token, callback) => {
    const query = `
        INSERT INTO tokens (username, token)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE token = ?
    `;

    connection.execute(
        query,
        [username, token, token], 
        (error, result) => {
            if (error) return callback(error);
            callback(null, result);
        }
    );
};

exports.findByToken = (token, callback) => {
    const query = 'SELECT * FROM tokens WHERE token = ?';
    connection.execute(query, [token], (error, results) => {
        if (error) return callback(error);
        callback(null, results);
    });
};

exports.deleteByToken = (token, callback) => {
    const query = 'DELETE FROM tokens WHERE token = ?';
    connection.execute(query, [token], (error, results) => {
        if (error) return callback(error);
        callback(null, results);
    });
};