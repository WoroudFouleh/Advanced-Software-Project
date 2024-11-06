const express = require('express');
const router = express.Router();
const discountController = require('../controllers/DiscountController');

router.post('/addDiscount', discountController.addDiscount);

router.get('/discounts/:item_id', discountController.getDiscounts);

module.exports = router;