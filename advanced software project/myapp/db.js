const mysql = require('mysql2');

// Create a connection pool to the database
const pool = mysql.createPool({
    host: 'localhost', // your host
    user: 'root', // your database username
    password: '123456789', // your database password
    database: 'noor', // your database name
});

// Export the pool as a promise-based connection
module.exports = pool.promise();



/*const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost', 
    user: 'root', 
    password: '123456789', 
    database: 'test' 
});


connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database as id ' + connection.threadId);
});

module.exports = connection;






/*const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost', // أو اسم المضيف إذا كان مختلفًا
    user: 'root', // اسم المستخدم الخاص بقاعدة البيانات
    password: '123456789', // كلمة مرور قاعدة البيانات
    database: 'test' // اسم قاعدة البيانات التي أنشأتها
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database as id ' + connection.threadId);
});
connection.query('SELECT * FROM customer', (err, results) => {
    if (err) {
        console.error('Error fetching data:', err);
        return;
    }
    console.log('Data fetched from the database:', results);
});
connection.end((err) => {
    if (err) {
        console.error('Error closing the connection:', err);
        return;
    }
    console.log('Connection closed.');
});

*/
