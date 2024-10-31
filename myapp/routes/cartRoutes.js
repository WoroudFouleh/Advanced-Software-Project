// routes/cartRoutes.js

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const checkPermissions = require('../middleware/checkPermissions');

// إضافة عنصر إلى السلة
router.post('/cart', checkPermissions, cartController.addItemToCart);

// جلب عناصر السلة للمستخدم
router.get('/cart', checkPermissions, cartController.getUserCart);

// تحديث كمية عنصر في السلة
router.put('/cart/:itemId', checkPermissions, cartController.updateCartItemQuantity);

// إزالة عنصر من السلة
router.delete('/cart/:itemId', checkPermissions, cartController.removeItemFromCart);

// تفريغ السلة
router.delete('/cart', checkPermissions, cartController.clearUserCart);

module.exports = router;