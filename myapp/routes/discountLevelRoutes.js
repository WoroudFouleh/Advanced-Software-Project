const express = require('express');
const router = express.Router();
const discountLevelController = require('../controllers/discountLevelController');  // Adjust the path as needed
const checkPermissions = require('../middleware/checkPermissions');  // Ensure this path is correct

// Admin-only routes for discount levels
router.get('/', checkPermissions, discountLevelController.getAllDiscountLevels);  // Get all discount levels
router.get('/:id', checkPermissions, discountLevelController.getDiscountLevelById);  // Get discount level by ID
router.post('/', checkPermissions, discountLevelController.createDiscountLevel);  // Create a new discount level
router.put('/:id', checkPermissions, discountLevelController.updateDiscountLevel);  // Update a discount level
router.delete('/:id', checkPermissions, discountLevelController.deleteDiscountLevel);  // Delete a discount level

module.exports = router;
