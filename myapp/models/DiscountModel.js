const db = require('../db');

// دالة لإضافة خصم جديد
const createDiscount = (itemId, discountType, discountValue, callback) => {
    const query = 'INSERT INTO item_discounts (item_id, discount_type, discount_value) VALUES (?, ?, ?)';
    db.execute(query, [itemId, discountType, discountValue], (error, results) => {
        if (error) {
            console.error("Error adding discount:", error);
            return callback(error);
        }
        callback(null, results);
    });
};

// دالة لاسترجاع الخصومات الخاصة بالعنصر
const getDiscountsByItemId = (itemId, callback) => {
    const query = 'SELECT discount_type, discount_value FROM item_discounts WHERE item_id = ?';
    db.execute(query, [itemId], (error, results) => {
        if (error) {
            console.error("Error fetching discounts:", error);
            return callback(error);
        }
        callback(null, results);
    });
};

module.exports = {
    createDiscount,
    getDiscountsByItemId,
};