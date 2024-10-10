const { Sequelize } = require('sequelize');

// إعداد الاتصال بقاعدة البيانات
const sequelize = new Sequelize('test', 'root', '123456789', {
    host: 'localhost',
    dialect: 'mysql', // تحديد أنك تستخدم MySQL
});

module.exports = sequelize;


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
