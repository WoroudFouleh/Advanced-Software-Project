const express = require('express');
const router = express.Router();
const pricingRulesController = require('../controllers/pricingRulesController');
const checkPermissions = require('../middleware/checkPermissions');

// مسارات قواعد التسعير
router.post('/add_pricing_rule',checkPermissions, pricingRulesController.createPricingRule);
router.get('/list_pricing_rules', pricingRulesController.getAllPricingRules);
router.get('/:id',pricingRulesController.getPricingRuleById);
router.put('/update_pricing_rule/:id',checkPermissions, pricingRulesController.updatePricingRule);
router.delete('/:id', pricingRulesController.deletePricingRule);

module.exports = router;
