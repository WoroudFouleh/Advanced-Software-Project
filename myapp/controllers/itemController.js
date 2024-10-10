const Item = require('../models/Items'); // تأكد من أن المسار صحيح
const { Op } = require('sequelize'); // تأكد من استيراد Op من Sequelize

exports.createItem = async (req, res) => {
    try {
        const { name, category, description, basePricePerDay, basePricePerHour, ownerId, availabilityStartDate, availabilityEndDate, status} = req.body;

        // تحقق من القيم المطلوبة
        if (!name || !category ||  !description || basePricePerDay === undefined || ownerId === undefined || !availabilityStartDate || !availabilityEndDate || !status) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // إنشاء عنصر جديد
        const newItem = await Item.create({
            name,
            category,
            description,
            basePricePerDay,
            basePricePerHour,
            ownerId,
            availabilityStartDate,
            availabilityEndDate,
            status,
        });

        return res.status(201).json({ message: "Item created successfully!", item: newItem });
    } catch (error) {
        console.error("Error details:", error);  // عرض تفاصيل الخطأ
        return res.status(500).json({ error: "An error occurred while creating the item.", details: error.message });
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
    const { name, catogary, description, basePricePerDay, basePricePerHour, ownerId, availabilityStartDate, availabilityEndDate, status } = req.body; // الحصول على البيانات من جسم الطلب

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
        if (catogary !== undefined) {
            item.name = catogary;
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


exports.filterItems = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, status } = req.query;

        const query = {}; // Empty object to build query conditions

        // Check for category filter
        if (category) {
            query.category = category; // Match the category directly
        }

        // Check for price filters
        if (minPrice || maxPrice) {
            query.basePricePerDay = {}; // Initialize as an object for min/max checks
            if (minPrice) {
                query.basePricePerDay[Op.gte] = Number(minPrice); // Greater than or equal to minPrice
            }
            if (maxPrice) {
                query.basePricePerDay[Op.lte] = Number(maxPrice); // Less than or equal to maxPrice
            }
        }

        // Check for status filter
        if (status) {
            query.status = status; // Match status directly
        }

        console.log("Query Object:", query); // Log the constructed query

        // Execute the query
        const items = await Item.findAll({
            where: query,
        });

        console.log("Retrieved items:", items); // طباعة العناصر المسترجعة

        if (!Array.isArray(items)) {
            return res.status(500).json({ error: "The response is not an array." });
        }

        if (items.length === 0) {
            return res.status(404).json({ message: "No items found matching the criteria." });
        }

        return res.status(200).json(items); // Return the matched items
    } catch (error) {
        console.error(error); // Log any errors
        return res.status(500).json({ error: "An error occurred while searching for items." });
    }
};
