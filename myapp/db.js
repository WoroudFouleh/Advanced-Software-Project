const mysql = require('mysql2');

// Setting up the database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's120WOROUD#',
    database: 'worouddb'
});

// Connecting to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:'+ err.stack);
        return;
    }
    console.log('Successfully connected to the database' + connection.threadId);
});


module.exports = connection;


