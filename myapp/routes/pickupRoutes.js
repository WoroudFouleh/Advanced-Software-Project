// routes/pickupRoutes.js

const express = require('express');
const router = express.Router();
const pickupController = require('../controllers/pickupController');

router.get('/pickup-locations', pickupController.getAllPickupLocations);

router.post('/booking/:orderId/pickup-location', pickupController.assignPickupLocation);

module.exports = router;