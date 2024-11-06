const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const checkPermissions = require('../middleware/checkPermissions');


router.post('/additems', checkPermissions, itemController.createItem);

router.get('/Allitems', checkPermissions, itemController.getAllItems);

router.get('/items/:id', checkPermissions, itemController.getItemById);

router.put('/updateItems/:id', checkPermissions, itemController.updateItem);

router.delete('/deleteitems/:id', checkPermissions, itemController.deleteItem);

router.get('/filter', checkPermissions, itemController.filterItems);

module.exports = router;