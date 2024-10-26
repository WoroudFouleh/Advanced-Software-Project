// db.js
const mysql = require('mysql2/promise');

// Setting up the database connection
const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'noor2'
});

module.exports = connection;
