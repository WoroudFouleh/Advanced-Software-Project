// discountRoutes.js

const express = require('express');
const router = express.Router();
const createDiscountCondition = require('../controllers/DiscountConditionController');

// نقطة النهاية لإضافة شرط الخصم
router.post('/discount-conditions', createDiscountCondition.createDiscountCondition);

module.exports = router;

/*// routes/discountConditions.js
const express = require('express');
const router = express.Router();
const DiscountConditionController = require('../controllers/DiscountConditionController');

// جميع طرق شروط الخصم
router.get('/', DiscountConditionController.getAllConditions); // عرض جميع الشروط
router.post('/', DiscountConditionController.createCondition); // إضافة شرط خصم
router.delete('/:id', DiscountConditionController.deleteCondition); // حذف شرط خصم

module.exports = router;
*/