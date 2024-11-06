// statisticsRoutes.js
const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

const checkPermissions = require('../middleware/checkPermissions');  // تأكد من مسار ملف الصلاحيات

router.get('/total-revenue', checkPermissions, statisticsController.getRevenueStatistics);
router.get('/daily-revenue', checkPermissions, statisticsController.getDailyRevenue);

module.exports = router;
