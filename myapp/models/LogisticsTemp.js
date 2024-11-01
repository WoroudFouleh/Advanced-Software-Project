const connection = require('../db');

// Create a logistics option
const createLogistics = async (data) => {
    const { userId, pickupLocation, deliveryAddress, deliveryOption, deliveryPrice, finalPrice } = data;

    const query = `
        INSERT INTO Logistics (userId, pickupLocation, deliveryAddress, deliveryOption, status, deliveryPrice, finalPrice, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, 'pending', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    const [result] = await connection.query(query, [userId, pickupLocation, deliveryAddress, deliveryOption, deliveryPrice, finalPrice]);
    return result;
};

// Get all logistics options
const getLogistics = async () => {
    const [rows] = await connection.query('SELECT * FROM Logistics');
    return rows; // تأكد من جلب deliveryPrice مع بقية البيانات
};
// Get logistics by ID
const getLogisticsById = async (id) => {
    const [rows] = await connection.query('SELECT * FROM Logistics WHERE id = ?', [id]);
    return rows[0]; // تأكد من جلب deliveryPrice مع بقية البيانات
};
// Update logistics
const updateLogistics = async (id, data) => {
    const { pickupLocation, deliveryAddress, deliveryOption, status, deliveryPrice } = data;

    // Fetch the existing logistics entry to retain the current values
    const logistics = await getLogisticsById(id);

    if (!logistics) {
        throw new Error('Logistics not found'); // Handle this error in your controller
    }

    // Only update fields that are provided, keep the current values for missing fields
    const updatedPickupLocation = pickupLocation || logistics.pickupLocation;
    const updatedDeliveryAddress = deliveryAddress || logistics.deliveryAddress;
    const updatedDeliveryOption = deliveryOption || logistics.deliveryOption;
    const updatedStatus = status || logistics.status;
    const updatedDeliveryPrice = deliveryPrice !== undefined ? deliveryPrice : logistics.deliveryPrice; // تحديث deliveryPrice

    const query = `
        UPDATE Logistics 
        SET pickupLocation = ?, deliveryAddress = ?, deliveryOption = ?, status = ?, deliveryPrice = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    const [result] = await connection.query(query, [
        updatedPickupLocation, updatedDeliveryAddress, updatedDeliveryOption, updatedStatus, updatedDeliveryPrice, id
    ]);
    return result;
};
// Delete logistics
const deleteLogistics = async (id) => {
    const [result] = await connection.query('DELETE FROM Logistics WHERE id = ?', [id]);
    return result;
};

// جلب جميع خيارات اللوجستيات الخاصة بمستخدم معين
const getLogisticsByUser = async (userId) => {
    const query = 'SELECT * FROM Logistics WHERE userId = ?';
    const [rows] = await connection.query(query, [userId]);
    return rows; // تأكد من جلب deliveryPrice مع بقية البيانات
};


// جلب جميع خيارات اللوجستيات حسب الحالة
const getLogisticsByStatus = async (status) => {
    const query = 'SELECT * FROM Logistics WHERE status = ?';
    const [rows] = await connection.query(query, [status]);
    return rows; // تأكد من جلب deliveryPrice مع بقية البيانات
};


// Export all the methods
module.exports = { createLogistics, getLogistics, getLogisticsById, updateLogistics, deleteLogistics, getLogisticsByUser,
    getLogisticsByStatus  };