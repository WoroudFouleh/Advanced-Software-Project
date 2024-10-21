const router = require("express").Router();
const pricingRulesController = require('../controllers/pricingRulesController');
const checkPermissions = require('../middleware/checkPermissions');

// Routes for pricing rules with permission checks
router.post('/add', checkPermissions, pricingRulesController.createPricingRule); // إضافة قاعدة تسعير جديدة
router.get('/list', checkPermissions, pricingRulesController.getAllPricingRules); // الحصول على جميع قواعد التسعير
//router.get('/view/:id', checkPermissions, pricingRulesController.getPricingRuleById); // عرض قاعدة تسعير محددة
router.put('/update/:id', checkPermissions, pricingRulesController.updatePricingRule); // تحديث قاعدة تسعير محددة
//router.delete('/delete/:id', checkPermissions, pricingRulesController.deletePricingRule); // حذف قاعدة تسعير محددة

module.exports = router;
