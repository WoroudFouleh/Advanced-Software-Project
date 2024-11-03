// controllers/itemController.js
const itemModel = require('../models/Items');
const db = require('../db');



// دالة إنشاء عنصر
exports.createItem = (req, res) => {
  const itemData = req.body;
  const username = req.user.username; // الحصول على username من التوكن بعد التعديل

  // إضافة username إلى البيانات قبل الإرسال إلى الموديل
  itemData.username = username;
  console.log("Item Data:", itemData);

  itemModel.createItem(itemData, (error, result) => {
      if (error) {
          console.error("Error details:", error.message);  // عرض تفاصيل الخطأ
          return res.status(500).json({ error: 'Error creating item', details: error.message });
      }
      res.status(201).json({ message: 'Item created successfully', result });
  });
};

// دالة استرجاع جميع العناصر
exports.getAllItems = async (req, res) => {
  const userRole = req.user.role; // افتراض أن role موجود في التوكن
  const username = req.user.username; // افتراض أن اسم المستخدم موجود في التوكن
  
    
    itemModel.getAllItems(userRole, username, (error, items) => {
      if (error) {
        return res.status(500).json({ error: 'Error retrieving items' });
      }
      res.status(200).json(items);
    });
  
};


// دالة استرجاع عنصر معين باستخدام ID
exports.getItemById = (req, res) => {
  const itemId = req.params.id;
  const userRole = req.user.role;
  const username = req.user.username;

  itemModel.getItemById(itemId, userRole, username, (error, item) => {
    if (error) {
      return res.status(500).json({ error: 'Error retrieving item' });
    }
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(200).json(item);
  });
};
// تحديث عنصر
exports.updateItem = (req, res) => {
    const itemId = req.params.id;
    const itemData = req.body;

    // أولاً، استرجع العنصر للتحقق من ملكيته
    itemModel.getItemById(itemId, (error, item) => {
        if (error || !item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        if (item.username !== req.user.username) {
            return res.status(403).json({ error: 'You do not have permission to update this item.' });
        }

        // إذا كان المالك صحيحًا، تابع التحديث
        itemModel.updateItem(itemId, itemData, (error, result) => {
            if (error) {
                return res.status(500).json({ error: 'Error updating item' });
            }
            res.status(200).json({ message: 'Item updated successfully', result });
        });
    });
};

// حذف عنصر
exports.deleteItem = (req, res) => {
    const itemId = req.params.id;

    // أولاً، استرجع العنصر للتحقق من ملكيته
    itemModel.getItemById(itemId, (error, item) => {
        if (error || !item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        if (item.username !== req.user.username) {
            return res.status(403).json({ error: 'You do not have permission to delete this item.' });
        }

        // إذا كان المالك صحيحًا، تابع الحذف
        itemModel.deleteItem(itemId, (error, result) => {
            if (error) {
                return res.status(500).json({ error: 'Error deleting item' });
            }
            res.status(200).json({ message: 'Item deleted successfully', result });
        });
    });
};

// دالة لتصفية العناصر
exports.filterItems = (req, res) => {
  const filters = req.query;

  itemModel.filterItems(filters, (error, items) => {
    if (error) {
      return res.status(500).json({ error: 'Error filtering items' });
    }
    res.status(200).json(items);
  });
};