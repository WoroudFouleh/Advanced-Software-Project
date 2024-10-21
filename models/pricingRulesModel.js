const db = require("../db");

const pricingRules = {
    create: (pricingData, user, callback) => {
        if (user.role !== 'owner') {
            return callback(new Error("Only the owner can create pricing rules."));
        }

        const { item_id, discount_rate, rental_duration_days } = pricingData;
        if (!item_id || !discount_rate || !rental_duration_days) {
            return callback(new Error("All fields are required."));
        }

        const query = `
            INSERT INTO pricing_rules (item_id, discount_rate, rental_duration_days)
            VALUES (?, ?, ?)
        `;

        db.execute(query, [item_id, discount_rate, rental_duration_days], (error, result) => {
            if (error) return callback(error);
            callback(null, result);
        });
    },

    update: (id, pricingData, user, callback) => {
        if (user.role !== 'owner' && user.role !== 'admin') {
            return callback(new Error("Only the owner or admin can update pricing rules."));
        }

        const { item_id, discount_rate, rental_duration_days } = pricingData;
        const query = `
            UPDATE pricing_rules
            SET item_id = ?, discount_rate = ?, rental_duration_days = ?
            WHERE id = ?
        `;

        db.execute(query, [item_id, discount_rate, rental_duration_days, id], (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    },

    getAll: (user, callback) => {
        if (user.role !== 'owner' && user.role !== 'admin') {
            return callback(new Error("Only the owner or admin can view pricing rules."));
        }

        const query = 'SELECT * FROM pricing_rules';
        db.execute(query, (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    },
};

module.exports = pricingRules;
