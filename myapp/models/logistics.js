const connection = require('../db');

// Create a logistics option
const createLogistics = async (data) => {
    const { userId, pickupLocation, deliveryAddress, deliveryOption } = data;
    const [rows] = await connection.query('INSERT INTO Logistics (userId, pickupLocation, deliveryAddress, deliveryOption) VALUES (?, ?, ?, ?)', 
        [userId, pickupLocation, deliveryAddress, deliveryOption]);
    return rows;
};
// Get all logistics options
const getLogistics = async () => {
    const [rows] = await connection.query('SELECT * FROM Logistics');
    return rows;
};
// Get logistics by ID
const getLogisticsById = async (id) => {
    const [rows] = await connection.query('SELECT * FROM Logistics WHERE id = ?', [id]);
    return rows[0];
};
// Export all the methods
module.exports = { createLogistics, getLogistics, getLogisticsById  };
