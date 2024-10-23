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
        // Create Logistics table
        await connection.query(`CREATE TABLE IF NOT EXISTS Logistics (
            id INT AUTO_INCREMENT PRIMARY KEY, 
            userId INT NOT NULL, 
            pickupLocation VARCHAR(255), 
            deliveryAddress VARCHAR(255), 
            deliveryOption ENUM('pickup', 'delivery') NOT NULL, 
            status ENUM('pending', 'completed', 'in_progress') DEFAULT 'pending'
        )`);

        // Create Items table
        await connection.query(`CREATE TABLE IF NOT EXISTS items (
            id INT AUTO_INCREMENT PRIMARY KEY, 
            name VARCHAR(255) NOT NULL, 
            category VARCHAR(255) NOT NULL, 
            description TEXT, 
            basePricePerDay DECIMAL(10, 2) NOT NULL, 
            basePricePerHour DECIMAL(10, 2) DEFAULT 0.0, 
            username VARCHAR(255) NOT NULL, 
            status VARCHAR(255) NOT NULL
        )`);

        // Create Tokens table
        await connection.query(`CREATE TABLE IF NOT EXISTS tokens (
            id INT AUTO_INCREMENT PRIMARY KEY, 
            username VARCHAR(255) NOT NULL, 
            token VARCHAR(255) NOT NULL
        )`);

        // Create Users table
        await connection.query(`CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY, 
            username VARCHAR(255) NOT NULL, 
            password VARCHAR(255) NOT NULL, 
            role ENUM('user', 'admin', 'owner', 'delivery') NOT NULL
        )`);

        console.log('Database and tables created/updated!');
    } catch (error) {
        console.error('Error syncing database:', error);
    }
}

syncDatabase(); // Call the function to sync the database

module.exports = connection;
