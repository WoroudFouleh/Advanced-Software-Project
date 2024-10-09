const Item = require('../models/Items'); // تأكد من أن المسار صحيح
const { Op } = require('sequelize'); // تأكد من استيراد Op من Sequelize

exports.createItem = async (req, res) => {
    try {
        const { name, description, basePricePerDay, basePricePerHour, ownerId, availabilityStartDate, availabilityEndDate } = req.body;

        // تحقق من القيم المطلوبة
        if (!name || !description || basePricePerDay === undefined || ownerId === undefined || !availabilityStartDate || !availabilityEndDate) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // إنشاء عنصر جديد
        const newItem = await Item.create({
            name,
            description,
            basePricePerDay,
            basePricePerHour,
            ownerId,
            availabilityStartDate,
            availabilityEndDate,
        });

        return res.status(201).json({ message: "Item created successfully!", item: newItem });
    } catch (error) {
        console.error(error); // طباعة الخطأ في وحدة التحكم
        return res.status(500).json({ error: "An error occurred while creating the item." });
    }
};
// دالة لاسترجاع جميع العناصر
exports.getAllItems = async (req, res) => {
    try {
        // استرجاع جميع العناصر
        const items = await Item.findAll();

        return res.status(200).json(items);
    } catch (error) {
        console.error(error); // طباعة الخطأ في وحدة التحكم
        return res.status(500).json({ error: "An error occurred while retrieving the items." });
    }
};


// دالة للحصول على عنصر معين عن طريق ID
exports.getItemById = async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await Item.findByPk(itemId); // البحث عن العنصر باستخدام معرفه (ID)

        if (!item) {
            return res.status(404).json({ error: "Item not found." });
        }

        return res.status(200).json(item);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "An error occurred while retrieving the item." });
    }
};

// دالة تحديث عنصر موجود
exports.updateItem = async (req, res) => {
    const { id } = req.params; // الحصول على الـ ID من المعلمات
    const { name, description, basePricePerDay, basePricePerHour, ownerId, availabilityStartDate, availabilityEndDate, status } = req.body; // الحصول على البيانات من جسم الطلب

    try {
        // تحقق من وجود العنصر
        const item = await Item.findByPk(id);
        if (!item) {
            return res.status(404).json({ error: "ID not found." });
        }

        // تحديث القيم فقط إذا كانت موجودة في جسم الطلب
        if (name !== undefined) {
            item.name = name;
        }
        if (description !== undefined) {
            item.description = description;
        }
        if (basePricePerDay !== undefined) {
            item.basePricePerDay = basePricePerDay;
        }
        if (basePricePerHour !== undefined) {
            item.basePricePerHour = basePricePerHour;
        }
        if (ownerId !== undefined) {
            item.ownerId = ownerId;
        }
        if (availabilityStartDate !== undefined) {
            item.availabilityStartDate = availabilityStartDate;
        }
        if (availabilityEndDate !== undefined) {
            item.availabilityEndDate = availabilityEndDate;
        }
        if (status !== undefined) {
            item.status = status;
        }

        // حفظ التحديثات
        await item.save();

        return res.status(200).json({ message: "Item updated successfully!", item });
    } catch (error) {
        console.error(error); // طباعة الخطأ في وحدة التحكم
        return res.status(500).json({ error: "An error occurred while updating the item." });
    }
};

// دالة حذف عنصر
exports.deleteItem = async (req, res) => {
    const { id } = req.params; // الحصول على الـ ID من المعلمات

    try {
        // تحقق من وجود العنصر
        const item = await Item.findByPk(id);
        if (!item) {
            return res.status(404).json({ error: "ID not found." });
        }

        // حذف العنصر
        await item.destroy();

        return res.status(200).json({ message: "Item deleted successfully!" });
    } catch (error) {
        console.error(error); // طباعة الخطأ في وحدة التحكم
        return res.status(500).json({ error: "An error occurred while deleting the item." });
    }
};




exports.searchItems = async (req, res) => {
    try {
        const { name, description, basePricePerDay, basePricePerHour, ownerId, availabilityStartDate, availabilityEndDate, status } = req.query;

        const query = {}; // كائن استعلام فارغ

        // تحقق من كل معلمة واستعد للاستعلام بناءً على وجودها
        if (name) {
            query.name = { [Op.like]: `%${name}%` }; // للبحث عن الأسماء التي تحتوي على النص
        }
        if (description) {
            query.description = { [Op.like]: `%${description}%` }; // للبحث عن الوصف
        }
        if (basePricePerDay) {
            query.basePricePerDay = Number(basePricePerDay); // تحويلها إلى رقم
        }
        if (basePricePerHour) {
            query.basePricePerHour = Number(basePricePerHour); // تحويلها إلى رقم
        }
        if (ownerId) {
            query.ownerId = Number(ownerId); // تحويلها إلى رقم
        }
        if (availabilityStartDate) {
            query.availabilityStartDate = { [Op.gte]: new Date(availabilityStartDate) }; // أكبر من أو يساوي
        }
        if (availabilityEndDate) {
            query.availabilityEndDate = { [Op.lte]: new Date(availabilityEndDate) }; // أقل من أو يساوي
        }
        if (status) {
            query.status = status; // يمكن أن تضيف شرطًا أكثر تعقيدًا هنا إذا كان لديك قيم متعددة
        }

        // استعلام قاعدة البيانات
        const items = await Item.findAll({
            where: query
        });

        // تحقق إذا كان هناك عناصر متاحة
        if (items.length === 0) {
            return res.status(404).json({ message: "No items found matching the criteria." });
        }

        return res.status(200).json(items);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "An error occurred while searching for items." });
    }
};
