const connection = require('../db');

// Create a logistics option
const createLogistics = async (data) => {
    const { userId, pickupLocation, deliveryAddress, deliveryOption, status } = data;
    const query = `
        INSERT INTO Logistics (userId, pickupLocation, deliveryAddress, deliveryOption, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    const [result] = await connection.query(query, [userId, pickupLocation, deliveryAddress, deliveryOption, status || 'pending']);
    return result;
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
const updateLogistics = async (id, data) => {
    const { pickupLocation, deliveryAddress, deliveryOption, status } = data;

    const logistics = await getLogisticsById(id);

    if (!logistics) {
        throw new Error('Logistics not found'); 
    }

    // Only update fields that are provided, keep the current values for missing fields
    const updatedPickupLocation = pickupLocation || logistics.pickupLocation;
    const updatedDeliveryAddress = deliveryAddress || logistics.deliveryAddress;
    const updatedDeliveryOption = deliveryOption || logistics.deliveryOption;
    const updatedStatus = status || logistics.status;

    const query = `
        UPDATE Logistics 
        SET pickupLocation = ?, deliveryAddress = ?, deliveryOption = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    const [result] = await connection.query(query, [
        updatedPickupLocation, updatedDeliveryAddress, updatedDeliveryOption, updatedStatus, id
    ]);
    return result;
};
const deleteLogistics = async (id) => {
    const [result] = await connection.query('DELETE FROM Logistics WHERE id = ?', [id]);
    return result;
};

const getLogisticsByUser = async (userId) => {
    const query = 'SELECT * FROM Logistics WHERE userId = ?';
    const [rows] = await connection.query(query, [userId]);
    return rows;
};

const getLogisticsByStatus = async (status) => {
    const query = 'SELECT * FROM Logistics WHERE status = ?';
    const [rows] = await connection.query(query, [status]);
    return rows;
};

module.exports = { createLogistics, getLogistics, getLogisticsById, updateLogistics, deleteLogistics, getLogisticsByUser,
    getLogisticsByStatus  };