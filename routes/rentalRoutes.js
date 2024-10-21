const express = require('express');
const router = express.Router();
const RentalPeriodController = require('../controllers/rentalPeriodController');

// إنشاء فترة إيجار جديدة
router.post('/AddRentalPeriod', RentalPeriodController.createRentalPeriod);

// استرجاع جميع فترات الإيجار
router.get('/GetAllRentalPeriod', RentalPeriodController.getAllRentalPeriods);

// استرجاع فترة إيجار معينة
router.get('/:id', RentalPeriodController.getRentalPeriodById);

// تحديث فترة إيجار
router.put('/:id', RentalPeriodController.updateRentalPeriod);

// حذف فترة إيجار
router.delete('/:id', RentalPeriodController.deleteRentalPeriod);

module.exports = router;
