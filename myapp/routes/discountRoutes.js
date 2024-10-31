const express = require('express');
const router = express.Router();
const discountController = require('../controllers/DiscountController');

// روت لإضافة خصم
router.post('/addDiscount', discountController.addDiscount);

// روت لاسترجاع خصومات العنصر
router.get('/discounts/:item_id', discountController.getDiscounts);

module.exports = router;