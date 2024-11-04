// pricingRulesController.js
const pricingRulesModel = require('../models/pricingRulesModel');

// إضافة قاعدة تسعير جديدة
const createPricingRule = (req, res) => {
    const { role } = req.user; // تأكد من استخراج الدور بشكل صحيح

    // تأكد من أن الدور يتطابق مع المطلوب
    if (role !== 'owner' && role !== 'admin') {
        return res.status(403).json({ success: false, message: "You do not have permission to perform this action." });
    }

    const newRule = req.body;

    // التحقق من المدخلات المطلوبة
    if (!newRule.item_id || !newRule.pricing_type || newRule.rate === undefined || 
        newRule.min_rental_period_days === undefined || !newRule.start_date || 
        !newRule.end_date || newRule.created_by === undefined) {
        return res.status(400).json({ success: false, message: "الرجاء تقديم جميع المعلومات المطلوبة." });
    }

    // تحقق من القيم الصحيحة
    if (typeof newRule.rate !== 'number' || (newRule.discount !== undefined && typeof newRule.discount !== 'number')) {
        return res.status(400).json({ success: false, message: "يجب أن تكون القيم العددية صحيحة." });
    }

    // تحقق من تواريخ البداية والنهاية
    if (new Date(newRule.start_date) >= new Date(newRule.end_date)) {
        return res.status(400).json({ success: false, message: "تاريخ البدء يجب أن يكون قبل تاريخ الانتهاء." });
    }

    // استدعاء الدالة لإدخال قاعدة التسعير في قاعدة البيانات
    pricingRulesModel.createPricingRule(newRule, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "حدث خطأ أثناء إضافة قاعدة التسعير." });
        }
        
        // إرسال الاستجابة النهائية بنجاح
        res.status(201).json({ success: true, id: result.insertId, ...newRule });
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