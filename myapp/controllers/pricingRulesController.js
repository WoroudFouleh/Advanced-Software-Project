// pricingRulesController.js
const pricingRulesModel = require('../models/pricingRulesModel');

// إضافة قاعدة تسعير جديدة
const createPricingRule = (req, res) =>


    {
        const { id: userId, role } = req.user; // استخراج userId و role من req.user
        const newRule = req.body;
    // التحقق من المدخلات المطلوبة
    if (!newRule.item_id || !newRule.pricing_type || newRule.rate === undefined || 
        newRule.min_rental_period_days === undefined || !newRule.start_date || 
        !newRule.end_date || newRule.created_by === undefined) {
        return res.status(400).json({ success: false, message: "Please provide all required information." });
    }

    // تحقق من أن `created_by` يتطابق مع المستخدم الحالي
    if (newRule.created_by !== userId) {
        return res.status(403).json({ success: false, message: "You are not authorized to create a pricing rule for another user." });
    }

    // تحقق من القيم الصحيحة
    if (typeof newRule.rate !== 'number' || (newRule.discount !== undefined && typeof newRule.discount !== 'number')) {
        return res.status(400).json({ success: false, message: "Please ensure all numeric values are correct." });
    }

    // تحقق من تواريخ البداية والنهاية
    if (new Date(newRule.start_date) >= new Date(newRule.end_date)) {
        return res.status(400).json({ success: false, message: "The start date must be before the end date." });
    }

    // استدعاء الدالة لإدخال قاعدة التسعير في قاعدة البيانات
    pricingRulesModel.createPricingRule(newRule, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "An error occurred while adding the pricing rule." });
        }
        
        // إرسال الاستجابة النهائية بنجاح
        res.status(201).json({ success: true, id: result.insertId, ...newRule });
    });
};

const getAllPricingRules = (req, res) => {
    const userId = req.user.id; // افترض أن الـ JWT يحتوي على معرف المستخدم
    const userRole = req.user.role; // الحصول على دور المستخدم

    pricingRulesModel.getAllPricingRules(userId, userRole, (err, rules) => {
        if (err) {
            return res.status(500).send(err.message || "Internal server error.");
        }
        res.json(rules);
    });
};

// دالة الحصول على قاعدة تسعير واحدة بناءً على معرف القاعدة
const getPricingRuleById = (req, res) => {
    console.log("req.user:", req.user);
    console.log("req.user.id:", req.user ? req.user.id : "undefined");
    console.log("req.user.role:", req.user ? req.user.role : "undefined");
    // التحقق من وجود req.user
    if (!req.user || !req.user.id || !req.user.role) {
        return res.status(401).json({ success: false, message: "Unauthorized. Please log in to access this resource." });
    }

    const userId = req.user.id;
    const userRole = req.user.role;
    const id = req.params.id;

    pricingRulesModel.getPricingRuleById(userId, userRole, id, (err, rule) => {
        if (err) {
            if (err.message.includes("Access denied")) {
                return res.status(403).json({ success: false, message: "Access denied. You are not authorized to view this pricing rule." });
            }
            return res.status(500).json({ success: false, message: "An error occurred while fetching the pricing rule." });
        }

        if (!rule || rule.length === 0) {
            return res.status(404).json({ success: false, message: "Pricing rule not found." });
        }

        res.json({ success: true, rule: rule[0] });
    });
};

// تحديث قاعدة التسعير
const updatePricingRule = (req, res) => {
    const id = req.params.id;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const updatedRule = req.body;

    if (!userRole || !userId) {
        return res.status(401).json({ success: false, message: "Unauthorized. Please log in to access this resource." });
    }

    pricingRulesModel.updatePricingRule(id, userId, userRole, updatedRule, (err) => {
        if (err) {
            if (err.message === "Pricing rule not found.") {
                return res.status(404).json({ success: false, message: err.message });
            }
            if (err.message.includes("Access denied")) {
                return res.status(403).json({ success: false, message: err.message });
            }
            return res.status(500).json({ success: false, message: "Error updating pricing rule." });
        }

        res.json({
            success: true,
            message: "Pricing rule updated successfully.",
            updatedValues: {
                item_id: updatedRule.item_id, // رقم الايتم لن يتغير من قبل المستخدم
                pricing_type: updatedRule.pricing_type || undefined, // يظهر فقط إذا تم تعديله
                rate: updatedRule.rate || undefined,
                min_rental_period_days: updatedRule.min_rental_period_days || undefined,
                min_rental_period_hours: updatedRule.min_rental_period_hours || undefined,
                start_date: updatedRule.start_date || undefined,
                end_date: updatedRule.end_date || undefined,
            }
        });
    });
};
const deletePricingRule = (req, res) => {
    const id = req.params.id;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    console.log("userId:", userId);
    console.log("userRole:", userRole);

    // تحقق من أن userRole و userId موجودين
    if (!userRole || !userId) {
        return res.status(401).json({ success: false, message: "Unauthorized. Please log in to access this resource." });
    }

    pricingRulesModel.deletePricingRule(userId, userRole, id, (err) => {
        if (err) {
            if (err.message.includes("not authorized")) {
                return res.status(403).send("Forbidden: You can only delete your own pricing rules");
            }
            return res.status(500).send("An error occurred while deleting the pricing rule.");
        }
        
        res.send("Pricing rule deleted successfully");
    });
};

module.exports = {
    createPricingRule,
    getAllPricingRules,
    getPricingRuleById,
    updatePricingRule,
    deletePricingRule
};