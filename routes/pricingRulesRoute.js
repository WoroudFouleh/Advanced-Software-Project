const express = require('express');
const router = express.Router();
const pricingRulesController = require('../controllers/pricingRulesController'); // تأكد من المسار صحيح
const checkPermissions = require('../middleware/checkPermissions');

// تأكد من أن هذه الدوال معرفة في pricingRulesController
router.post('/add_pricing_rule', checkPermissions, pricingRulesController.createPricingRule);
router.put('/update_pricing_rule/:id', checkPermissions, pricingRulesController.updatePricingRule);
router.get('/list_pricing_rules', checkPermissions, pricingRulesController.getAllPricingRules);

module.exports = router;
