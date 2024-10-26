// routes/seasonRoutes.js
const express = require("express");
const router = express.Router();
const seasonController = require('../controllers/seasonController');
const checkPermissions = require('../middleware/checkPermissions');

// Routes for seasons with permission checks
router.post('/add', checkPermissions, seasonController.createSeason); // إضافة موسم جديد
router.get('/list', checkPermissions,seasonController.getAllSeasons); // الحصول على جميع المواسم
router.put('/update/:id', checkPermissions, seasonController.updateSeason); // تحديث موسم معين
router.delete('/delete/:id', checkPermissions, seasonController.deleteSeason); // حذف موسم معين

module.exports = router;
