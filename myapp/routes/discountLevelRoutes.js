const express = require('express');
const router = express.Router();
const discountLevelController = require('../controllers/discountLevelController');  
const checkPermissions = require('../middleware/checkPermissions');  

// Admin-only routes for discount levels
router.get('/', checkPermissions, discountLevelController.getAllDiscountLevels);  
router.get('/:id', checkPermissions, discountLevelController.getDiscountLevelById); 
router.post('/', checkPermissions, discountLevelController.createDiscountLevel);  
router.put('/:id', checkPermissions, discountLevelController.updateDiscountLevel);  
router.delete('/:id', checkPermissions, discountLevelController.deleteDiscountLevel);  

module.exports = router;
