// userPointsHistoryRoutes.js
const express = require('express');
const router = express.Router();
const userPointsHistoryController = require('../controllers/userPointsHistoryController');
const checkPermissions = require('../middleware/checkPermissions');

// المسارات الخاصة بنقاط المستخدم
router.get('/', checkPermissions, userPointsHistoryController.getAllUserPointsHistory); // المستخدمين فقط لرؤية نقاطهم
router.post('/', checkPermissions, userPointsHistoryController.addUserPointsHistory); // الإداريين فقط لإضافة نقاط
router.put('/:id', checkPermissions, userPointsHistoryController.updateUserPointsHistory); // الإداريين فقط لتحديث نقاط
router.delete('/:id', checkPermissions, userPointsHistoryController.deleteUserPointsHistory); // الإداريين فقط لحذف نقاط

module.exports = router;