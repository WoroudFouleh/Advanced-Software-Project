const connection = require('../db');

// Create a logistics option
const createLogistics = async (data) => {
    const { userId, pickupLocation, deliveryAddress, deliveryOption } = data;
    const [rows] = await connection.query('INSERT INTO Logistics (userId, pickupLocation, deliveryAddress, deliveryOption) VALUES (?, ?, ?, ?)', 
        [userId, pickupLocation, deliveryAddress, deliveryOption]);
    return rows;
};

// Export all the methods
module.exports = { createLogistics };
