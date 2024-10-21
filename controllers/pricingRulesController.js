const pricingRulesModel = require("../models/pricingRulesModel");

exports.createPricingRule = (req, res) => {
    const pricingData = req.body;
    const user = req.user;

    pricingRulesModel.create(pricingData, user, (error, result) => {
        if (error) {
            return res.status(500).json({ message: "Error creating pricing rule", error });
        }
        res.status(201).json({ message: "Pricing rule created successfully", data: result });
    });
};
exports.updatePricingRule = (req, res) => {
    const { id } = req.params; // تأكد من أن هذا هو item_id الصحيح
    const pricingData = req.body; // بيانات التسعير من الجسم
    const user = req.user; // معلومات المستخدم

    console.log("Updating pricing rule with item_id:", id); // سجل id المستخدم
    console.log("New pricing data:", pricingData); // سجل البيانات الجديدة

    pricingRulesModel.update(id, pricingData, user, (error, result) => {
        if (error) {
            return res.status(500).json({ message: "Error updating pricing rule", error });
        }

        // تحقق من نتيجة الاستعلام
        console.log("Update result:", result); // سجل نتيجة التحديث

        // تحقق من عدد الصفوف المتطابقة
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No matching pricing rule found to update." });
        }

        res.status(200).json({ message: "Pricing rule updated successfully", data: result });
    });
};

exports.getAllPricingRules = (req, res) => {
    const user = req.user;

    pricingRulesModel.getAll(user, (error, results) => {
        if (error) {
            return res.status(500).json({ message: "Error fetching pricing rules", error });
        }
        res.status(200).json(results);
    });
};
