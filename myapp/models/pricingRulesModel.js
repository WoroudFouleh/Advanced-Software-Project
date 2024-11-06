const db = require("../db");

const createPricingRule = (pricingRule, callback) => {
    const query = `
        INSERT INTO pricing_rules 
        (item_id, pricing_type, rate, min_rental_period_days, min_rental_period_hours, start_date, end_date, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`; 

    db.query(query, [
        pricingRule.item_id,
        pricingRule.pricing_type,
        pricingRule.rate,
        pricingRule.min_rental_period_days,
        pricingRule.min_rental_period_hours,
        pricingRule.start_date,
        pricingRule.end_date,
        pricingRule.created_by
    ], callback);
};

const getAllPricingRules = (userId, userRole, callback) => {
    let query;
    const params = [];

    if (userRole.toLowerCase() === 'admin') {
        query = 'SELECT * FROM pricing_rules';
    } else if (userRole.toLowerCase() === 'owner') {
        query = 'SELECT * FROM pricing_rules WHERE created_by = ?';
        params.push(userId);
    } else {
        return callback(new Error("Access denied. Invalid user role."), null);
    }

    db.query(query, params, callback);
};
const getPricingRuleById = (userId, userRole, id, callback) => {
    let query;
    const params = [id];

    if (userRole.toLowerCase() === 'admin') {
        query = 'SELECT * FROM pricing_rules WHERE id = ?';
    } else if (userRole.toLowerCase() === 'owner') {
        query = 'SELECT * FROM pricing_rules WHERE id = ? AND created_by = ?';
        params.push(userId);
    } else {
        return callback(new Error("Access denied. Invalid user role."), null);
    }

    db.query(query, params, callback);
};

const updatePricingRule = (id, userId, userRole, updatedRule, callback) => {
    if (!updatedRule.created_by) {
        return callback(new Error("created_by must be provided."));
    }

    const getCurrentRuleQuery = `SELECT * FROM pricing_rules WHERE id = ?`;
    db.query(getCurrentRuleQuery, [id], (err, results) => {
        if (err) return callback(err);
        if (results.length === 0) return callback(new Error("Pricing rule not found."));

        const currentRule = results[0];
        const query = `
            UPDATE pricing_rules 
            SET pricing_type = ?, rate = ?, min_rental_period_days = ?, min_rental_period_hours = ?, start_date = ?, end_date = ?
            WHERE id = ?`;

        const params = [
            updatedRule.pricing_type || currentRule.pricing_type, 
            updatedRule.rate || currentRule.rate,
            updatedRule.min_rental_period_days || currentRule.min_rental_period_days,
            updatedRule.min_rental_period_hours || currentRule.min_rental_period_hours,
            updatedRule.start_date || currentRule.start_date,
            updatedRule.end_date || currentRule.end_date,
            id
        ];

        if (userRole.toLowerCase() === 'admin') {
            params.unshift(currentRule.item_id); 
            db.query(`
                UPDATE pricing_rules 
                SET item_id = ?, pricing_type = ?, rate = ?, min_rental_period_days = ?, min_rental_period_hours = ?, start_date = ?, end_date = ?, created_by = ?
                WHERE id = ?`, 
                [...params, updatedRule.created_by, id], 
                callback);
        } else if (userRole.toLowerCase() === 'owner' && currentRule.created_by === userId) {
            db.query(query, params, callback);
        } else {
            return callback(new Error("Access denied. You can only update your own pricing rules."));
        }
    });
};

const deletePricingRule = (userId, userRole, id, callback) => {
    let query;
    const params = [id];

    if (userRole.toLowerCase() === 'admin') {
        query = 'DELETE FROM pricing_rules WHERE id = ?';
    } else if (userRole.toLowerCase() === 'owner') {
        query = 'DELETE FROM pricing_rules WHERE id = ? AND created_by = ?';
        params.push(userId);
    } else {
        return callback(new Error("Access denied. Invalid user role."), null);
    }

    db.query(query, params, (err, results) => {
        if (err) return callback(err);
        if (results.affectedRows === 0) {
            return callback(new Error("No pricing rule found to delete or not authorized"));
        }
        callback(null); 
    });
};
module.exports = {
    createPricingRule,
    getAllPricingRules,
    getPricingRuleById,
    updatePricingRule,
    deletePricingRule
};