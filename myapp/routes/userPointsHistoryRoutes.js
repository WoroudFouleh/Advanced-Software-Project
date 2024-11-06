// userPointsHistoryRoutes.js
const express = require('express');
const router = express.Router();
const userPointsHistoryController = require('../controllers/userPointsHistoryController');
const checkPermissions = require('../middleware/checkPermissions');

router.get('/', checkPermissions, userPointsHistoryController.getAllUserPointsHistory); 
router.post('/', checkPermissions, userPointsHistoryController.addUserPointsHistory); 
router.put('/:id', checkPermissions, userPointsHistoryController.updateUserPointsHistory); 
router.delete('/:id', checkPermissions, userPointsHistoryController.deleteUserPointsHistory); 

module.exports = router;
