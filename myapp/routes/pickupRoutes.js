// routes/pickupRoutes.js

const express = require('express');
const router = express.Router();
const pickupController = require('../controllers/pickupController');

// Route to get all pickup locations
router.get('/pickup-locations', pickupController.getAllPickupLocations);

// Route to assign a pickup location to an order
router.post('/booking/:orderId/pickup-location', pickupController.assignPickupLocation);

module.exports = router;
