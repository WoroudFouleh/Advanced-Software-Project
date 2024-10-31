// pricingRulesController.js
const pricingRulesModel = require('../models/pricingRulesModel');

// إضافة قاعدة تسعير جديدة
const createPricingRule = (req, res) => {
    const newRule = req.body;
    pricingRulesModel.createPricingRule(newRule, (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ id: result.insertId, ...newRule });
    });
};

// الحصول على جميع قواعد التسعير
const getAllPricingRules = (req, res) => {
    pricingRulesModel.getAllPricingRules((err, rules) => {
        if (err) return res.status(500).send(err);
        res.json(rules);
    });
};

// الحصول على قاعدة تسعير واحدة
const getPricingRuleById = (req, res) => {
    const id = req.params.id;
    pricingRulesModel.getPricingRuleById(id, (err, rule) => {
        if (err) return res.status(500).send(err);
        if (rule.length === 0) return res.status(404).send('Pricing rule not found');
        res.json(rule[0]);
    });
};

// تحديث قاعدة التسعير
const updatePricingRule = (req, res) => {
    const id = req.params.id;
    const updatedRule = req.body;
    pricingRulesModel.updatePricingRule(id, updatedRule, (err) => {
        if (err) return res.status(500).send(err);
        res.send('Pricing rule updated successfully');
    });
};

// حذف قاعدة تسعير
const deletePricingRule = (req, res) => {
    const id = req.params.id;
    pricingRulesModel.deletePricingRule(id, (err) => {
        if (err) return res.status(500).send(err);
        res.send('Pricing rule deleted successfully');
    });
};

module.exports = {
    createPricingRule,
    getAllPricingRules,
    getPricingRuleById,
    updatePricingRule,
    deletePricingRule
};