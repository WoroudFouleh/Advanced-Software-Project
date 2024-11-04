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
    ], callback); // تقديم 8 قيم تتطابق مع 8 أعمدة.
};


const getAllPricingRules = (callback) => {
    const query = 'SELECT * FROM pricing_rules';
    db.query(query, callback);
};

// وظيفة للحصول على قاعدة تسعير واحدة بناءً على المعرف
const getPricingRuleById = (id, callback) => {
    const query = 'SELECT * FROM pricing_rules WHERE id = ?';
    db.query(query, [id], callback);
};

// وظيفة لتحديث قاعدة التسعير
const updatePricingRule = (id, pricingRule, callback) => {
    const query = `
        UPDATE pricing_rules 
        SET item_id = ?, pricing_type = ?, rate = ?, min_rental_period_days = ?, min_rental_period_hours = ?, start_date = ?, end_date = ?, created_by = ?
        WHERE id = ?`;
    
    db.query(query, [
        pricingRule.item_id,
        pricingRule.pricing_type,
        pricingRule.rate,
        pricingRule.min_rental_period_days,
        pricingRule.min_rental_period_hours,
        pricingRule.start_date,
        pricingRule.end_date,
        pricingRule.created_by,
        id
    ], callback);
};

// وظيفة لحذف قاعدة تسعير
const deletePricingRule = (id, callback) => {
    const query = 'DELETE FROM pricing_rules WHERE id = ?';
    db.query(query, [id], callback);
};

module.exports = {
    createPricingRule,
    getAllPricingRules,
    getPricingRuleById,
    updatePricingRule,
    deletePricingRule
};

/*
const pricingRules = {
    create: (pricingData, user, callback) => {
        if (user.role !== 'owner') {
            console.log("Permission denied: User with role '" + user.role + "' tried to create a pricing rule.");
            return callback(new Error("Only the owner can create pricing rules."));
        }
        

        const { item_id, pricing_type, discount_rate, min_rental_period_days, start_date, end_date, season_id } = pricingData;
        if (!item_id || !pricing_type || !min_rental_period_days || !start_date || !end_date) {
            return callback(new Error("All fields are required."));
        }

        const query = `
            INSERT INTO pricing_rules (item_id, pricing_type, discount_rate, min_rental_period_days, start_date, end_date, season_id, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.execute(query, [item_id, pricing_type, discount_rate, min_rental_period_days, start_date, end_date, season_id, user.id], (error, result) => {
            if (error) return callback(error);
            callback(null, result);
        });
    },

    update: (id, pricingData, user, callback) => {
        if (user.role !== 'owner' && user.role !== 'admin') {
            return callback(new Error("Only the owner or admin can update pricing rules."));
        }

        const { item_id, pricing_type, discount_rate, min_rental_period_days, start_date, end_date, season_id } = pricingData;

        const query = `
            UPDATE pricing_rules
            SET item_id = ?, pricing_type = ?, discount_rate = ?, min_rental_period_days = ?, start_date = ?, end_date = ?, season_id = ?
            WHERE id = ?
        `;

        db.execute(query, [item_id, pricing_type, discount_rate, min_rental_period_days, start_date, end_date, season_id, id], (error, results) => {
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

    getById: (id, callback) => {
        const query = 'SELECT * FROM pricing_rules WHERE id = ?';
        db.execute(query, [id], (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    },

    delete: (id, user, callback) => {
        if (user.role !== 'owner' && user.role !== 'admin') {
            return callback(new Error("Only the owner or admin can delete pricing rules."));
        }

        const query = 'DELETE FROM pricing_rules WHERE id = ?';
        db.execute(query, [id], (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    },
};

module.exports = pricingRules;*/