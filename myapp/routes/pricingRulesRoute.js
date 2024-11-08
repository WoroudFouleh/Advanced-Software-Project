const express = require('express');
const router = express.Router();
const pricingRulesController = require('../controllers/pricingRulesController');
const checkPermissions = require('../middleware/checkPermissions');

router.post('/add_pricing_rule', checkPermissions,pricingRulesController.createPricingRule);
router.get('/list_pricing_rules',checkPermissions, pricingRulesController.getAllPricingRules);
router.get('/getPricingRuleById/:id',checkPermissions,pricingRulesController.getPricingRuleById);
router.put('/update_pricing_rule/:id',checkPermissions, pricingRulesController.updatePricingRule);
router.delete('/deletePricingRule/:id',checkPermissions, pricingRulesController.deletePricingRule);

module.exports = router;