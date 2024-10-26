const PricingRule = require("../models/pricingRulesModel");
exports.createPricingRule = async (req, res) => {
    try {
        const pricingData = req.body;
        const user = req.user;

        // تحقق من وجود معلومات المستخدم
        if (!user || !user._id) {
            console.error("User data is missing:", user);
            return res.status(403).json({ message: "User not authorized." });
        }

        // إضافة المستخدم إلى بيانات التسعير
        pricingData.ownerId = user._id; // تأكد من وجود حقل ownerId في النموذج

        const result = await PricingRule.create(pricingData);
        res.status(201).json({ message: "Pricing rule created successfully", data: result });
    } catch (error) {
        console.error("Error creating pricing rule:", error);
        res.status(500).json({ message: "Error creating pricing rule", error });
    }
};


exports.updatePricingRule = async (req, res) => {
    const { id } = req.params; // تأكد من أن هذا هو item_id الصحيح
    const pricingData = req.body; // بيانات التسعير من الجسم
    const user = req.user; // معلومات المستخدم

    console.log("Updating pricing rule with item_id:", id); // سجل id المستخدم
    console.log("New pricing data:", pricingData); // سجل البيانات الجديدة

    try {
        const result = await PricingRule.findByIdAndUpdate(id, pricingData, { new: true });
        
        // تحقق من نتيجة الاستعلام
        if (!result) {
            return res.status(404).json({ message: "No matching pricing rule found to update." });
        }

        res.status(200).json({ message: "Pricing rule updated successfully", data: result });
    } catch (error) {
        console.error("Error updating pricing rule:", error);
        return res.status(500).json({ message: "Error updating pricing rule", error });
    }
};

exports.getAllPricingRules = async (req, res) => {
    try {
        const user = req.user; // تأكد من أن المستخدم متاح هنا
        let pricingRules;

        if (user.role.toLowerCase() === 'admin') {
            // إذا كان الإداري، احصل على جميع قواعد التسعير
            pricingRules = await PricingRule.find({});
        } else if (user.role.toLowerCase() === 'owner') {
            // إذا كان المالك، احصل على قواعد التسعير الخاصة به
            pricingRules = await PricingRule.find({ ownerId: user._id }); // تأكد من وجود حقل ownerId في النموذج
        } else {
            return res.status(403).send("Access denied.");
        }

        return res.status(200).json(pricingRules);
    } catch (error) {
        console.error("Error fetching pricing rules:", error);
        return res.status(500).send("Internal Server Error.");
    }
};
