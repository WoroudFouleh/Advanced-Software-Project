const mysql = require('mysql2/promise');

// إعداد الاتصال بقاعدة البيانات
const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'noor2',
    password: ''
});

async function syncDatabase() {
    try {
        await connection.query('CREATE TABLE IF NOT EXISTS Logistics (id INT AUTO_INCREMENT PRIMARY KEY, userId INT NOT NULL, pickupLocation VARCHAR(255), deliveryAddress VARCHAR(255), deliveryOption ENUM("pickup", "delivery") NOT NULL, status ENUM("pending", "completed") DEFAULT "pending")');
        console.log('Database and tables created/updated!');
    } catch (error) {
        console.error('Error syncing database:', error);
    }
}

syncDatabase();

module.exports = connection;


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
