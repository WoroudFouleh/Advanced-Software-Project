// insuranceModel.js
const db = require('../db'); 

const getAllInsurance = async () => {
    const query = 'SELECT * FROM insurance';
    const [results] = await db.execute(query);
    return results;
};
const getInsuranceByUserId = async (user_id) => {
    const query = 'SELECT * FROM insurance WHERE user_id = ?';
    const [rows] = await db.execute(query, [user_id]);
    return rows;
};

const deleteInsuranceById = async (id) => {
    const query = 'DELETE FROM insurance WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result;
};

module.exports = {
    getAllInsurance,
    deleteInsuranceById,
    getInsuranceByUserId
};