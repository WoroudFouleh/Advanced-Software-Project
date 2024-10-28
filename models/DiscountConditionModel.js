// models/DiscountConditionModel.js
const db = require("../db");

// استرجاع جميع شروط الخصم
const getAllConditions = (callback) => {
    const query = 'SELECT * FROM discount_conditions';
    db.query(query, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
};
const createCondition = (condition_description, discount_type, created_by, callback) => {
    const query = 'INSERT INTO discount_conditions (condition_description, discount_type, created_by) VALUES (?, ?, ?)';
    db.query(query, [condition_description, discount_type, created_by], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, { id: results.insertId, condition_description, discount_type, created_by });
    });
};

// حذف شرط خصم
const deleteCondition = (id, callback) => {
    const query = 'DELETE FROM discount_conditions WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        if (results.affectedRows === 0) {
            return callback(new Error('Condition not found'), null);
        }
        callback(null);
    });
};

module.exports = {
    getAllConditions,
    createCondition,
    deleteCondition,
};
