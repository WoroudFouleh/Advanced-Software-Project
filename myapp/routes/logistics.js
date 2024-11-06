const express = require('express');
const router = express.Router();
const logisticsPermissions = require('../middleware/logisticsPermissions');
const { 
    createLogistics,
    getLogistics,
    getLogisticsById,
    updateLogistics,
    deleteLogistics,
    getNearbyLocations,
    getLogisticsByUser,
    getLogisticsByStatus,
    processPayment 
} = require('../controllers/logisticsController');

router.post('/create', logisticsPermissions, createLogistics);

router.get('/nearby-locations', getNearbyLocations);

router.get('/user/:userId', getLogisticsByUser);

router.get('/status/:status', getLogisticsByStatus);

router.get('/', getLogistics);

router.put('/:id', logisticsPermissions, updateLogistics);

router.delete('/:id', logisticsPermissions, deleteLogistics);

router.get('/:id', getLogisticsById);

router.post('/pay', logisticsPermissions, processPayment);

module.exports = router;