const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const checkPermissions = require('../middleware/checkPermissions');

// POST /api/items - Create Item Listing (Admin و Owner فقط)
router.post('/additems', checkPermissions, itemController.createItem);

// GET /api/items - Get All Items (جميع الأنواع)
router.get('/Allitems', checkPermissions, itemController.getAllItems);

// GET /api/items/:id - Get Item by ID (جميع الأنواع)
router.get('/items/:id', checkPermissions, itemController.getItemById);

// PUT /api/items/{id} - Update Item Listing (Admin و Owner فقط)
router.put('/updateItems/:id', checkPermissions, itemController.updateItem);

// DELETE /api/items/:id - Delete Item Listing (Admin و Owner فقط)
router.delete('/deleteitems/:id', checkPermissions, itemController.deleteItem);

// GET /api/items/filter - Search Items (جميع الأنواع)
router.get('/filter', checkPermissions, itemController.filterItems);

module.exports = router;