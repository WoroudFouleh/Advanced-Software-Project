const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's120WOROUD#',
    database: 'worouddb'
});

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