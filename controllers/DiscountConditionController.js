// discountController.js

const db = require('../db'); // تأكد من استيراد الاتصال بقاعدة البيانات
const itemModel = require('../models/DiscountConditionModel');

// دالة لإضافة شرط الخصم
const createDiscountCondition = (req, res) => {
    const { condition_description, discount_type, created_by } = req.body;

    // تحقق من وجود كل القيم المطلوبة
    if (!condition_description || !discount_type || !created_by) {
        return res.status(400).json({
            success: false,
            message: "خطأ: جميع الحقول المطلوبة يجب أن تكون موجودة."
        });
    }

    // إضافة الشرط إلى قاعدة البيانات
    const query = 'INSERT INTO discount_conditions (condition_description, discount_type, created_by) VALUES (?, ?, ?)';
    db.query(query, [condition_description, discount_type, created_by], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "حدث خطأ أثناء إضافة شرط الخصم. يرجى المحاولة مرة أخرى لاحقًا."
            });
        }

        // إذا نجح الإدخال
        return res.status(201).json({
            success: true,
            message: "تم إضافة شرط الخصم بنجاح.",
            data: {
                id: results.insertId,
                condition_description,
                discount_type,
                created_by,
                created_at: new Date().toISOString() // تاريخ الإنشاء
            }
        });
    });
};

// تصدير الوظيفة لاستخدامها في الرواتر
module.exports = {
    createDiscountCondition,
};
