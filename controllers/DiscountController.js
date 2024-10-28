const discountModel = require('../models/DiscountModel');

// دالة لإضافة خصم جديد
const addDiscount = (req, res) => {
    const { item_id, discount_type, discount_value } = req.body;

    if (!item_id || !discount_type || discount_value === undefined) {
        return res.status(400).json({ success: false, message: "الرجاء تقديم جميع المعلومات المطلوبة." });
    }

    discountModel.createDiscount(item_id, discount_type, discount_value, (error, result) => {
        if (error) {
            return res.status(500).json({ success: false, message: "حدث خطأ أثناء إضافة الخصم." });
        }
        res.status(201).json({ success: true, message: "تم إضافة الخصم بنجاح.", data: result });
    });
};

// دالة لاسترجاع الخصومات الخاصة بالعنصر
const getDiscounts = (req, res) => {
    const itemId = req.params.item_id;

    discountModel.getDiscountsByItemId(itemId, (error, discounts) => {
        if (error) {
            return res.status(500).json({ success: false, message: "حدث خطأ أثناء استرجاع الخصومات." });
        }
        res.status(200).json({ success: true, discounts });
    });
};

module.exports = {
    addDiscount,
    getDiscounts,
};
