// routes/cartRoutes.js

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const checkPermissions = require('../middleware/checkPermissions');

router.post('/cart', checkPermissions, cartController.addItemToCart);

router.get('/cart', checkPermissions, cartController.getUserCart);

router.put('/cart/:itemId', checkPermissions, cartController.updateCartItemQuantity);

router.delete('/cart/:itemId', checkPermissions, cartController.removeItemFromCart);

router.delete('/cart', checkPermissions, cartController.clearUserCart);

module.exports = router;