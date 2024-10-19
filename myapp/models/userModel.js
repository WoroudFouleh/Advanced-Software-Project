// models/User.js
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's120WOROUD#',
    database: 'worouddb'
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
    },
    
    findAll: (callback) => {
        const query = 'SELECT id, username, role FROM users';
        db.query(query, callback);
    },
    deleteById: (userId, callback) => {
        const query = 'DELETE FROM users WHERE id = ?';
        db.query(query, [userId], callback);
    }
    /*
    
    updateById: (userId, username, password, callback) => {
        const query = 'UPDATE users SET username = ?, password = ? WHERE id = ?';
        db.query(query, [username, password, userId], callback);
    },
    findByRoleOrUsername: (searchTerm, callback) => {
        const query = 'SELECT * FROM users WHERE role = ? OR username = ?';
        db.query(query, [searchTerm, searchTerm], callback);
    },
    findById: (userId, callback) => {
        const query = 'SELECT * FROM users WHERE id = ?';
        db.query(query, [userId], callback);
    }*/
};

module.exports = User;
