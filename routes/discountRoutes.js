const express = require('express');
const router = express.Router();
const discountController = require('../controllers/DiscountController');
const checkPermissions = require('../middleware/checkPermissions');

// روت لإضافة خصم
router.post('/addDiscount',checkPermissions,discountController.addDiscount);

// روت لاسترجاع خصومات العنصر
router.get('/discounts/:item_id',checkPermissions, discountController.getDiscounts);

module.exports = router;
