const mysql = require('mysql2');


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'noor2',
    password: ''
});

db.connect(err => {
    if (err) throw err;
    console.log('Database connected!');
});

const User = {
    create: (username, password, role, callback) => {
        const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        db.query(query, [username, password, role], callback);
    },
    findByUsername: (username, callback) => {
        const query = 'SELECT * FROM users WHERE username = ?';
        db.query(query, [username], callback);
    }
};

module.exports = User;