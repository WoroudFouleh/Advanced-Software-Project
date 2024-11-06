const express = require('express');
const router = express.Router();
const RentalPeriodController = require('../controllers/rentalPeriodController');
const checkPermissions = require('../middleware/checkPermissions');

router.post('/AddRentalPeriod', checkPermissions, RentalPeriodController.createRentalPeriod);

router.put('/updateRentalPeriod/:id', checkPermissions, RentalPeriodController.updateRentalPeriod);

router.delete('/deleteRentalPeriod/:id', checkPermissions, RentalPeriodController.deleteRentalPeriod);

module.exports = router;