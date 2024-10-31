const express = require('express');
const router = express.Router();
const RentalPeriodController = require('../controllers/rentalPeriodController');
const checkPermissions = require('../middleware/checkPermissions');

// إنشاء فترة إيجار جديدة (محمية بصلاحيات المالك فقط)
router.post('/AddRentalPeriod', checkPermissions, RentalPeriodController.createRentalPeriod);

// تعديل فترة إيجار (محمية بصلاحيات المالك فقط)
router.put('/updateRentalPeriod/:id', checkPermissions, RentalPeriodController.updateRentalPeriod);

// حذف فترة إيجار (محمية بصلاحيات المالك فقط)
router.delete('/deleteRentalPeriod/:id', checkPermissions, RentalPeriodController.deleteRentalPeriod);

module.exports = router;