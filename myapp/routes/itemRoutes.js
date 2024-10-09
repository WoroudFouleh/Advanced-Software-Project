const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController')

// POST /api/items - Create Item Listing
router.post('/additems', itemController.createItem);
// GET /api/items - Get All Items
router.get('/Allitems', itemController.getAllItems);

// GET /api/items/:id - Get Item by ID
router.get('/items/:id', itemController.getItemById);

// PUT /api/items/{id} - Update Item Listing
router.put('/updateItems/:id', itemController.updateItem);

// DELETE /api/items/:id - Delete Item Listing
router.delete('/deleteitems/:id', itemController.deleteItem);

module.exports = router;
