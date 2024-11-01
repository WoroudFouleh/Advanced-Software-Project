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

// Route to create a logistics option (pickup or delivery)
router.post('/create', logisticsPermissions, createLogistics);

// Route to get nearby logistics options
router.get('/nearby', getNearbyLocations);

// Route to get logistics by user ID
router.get('/user/:userId', getLogisticsByUser);

// Route to get logistics by status
router.get('/status/:status', getLogisticsByStatus);

// Route to get all logistics options
router.get('/', getLogistics);

// Route to get logistics by ID
router.get('/:id', getLogisticsById);

// Route to update a logistics option
router.put('/:id', logisticsPermissions, updateLogistics);

// Route to delete a logistics option
router.delete('/:id', logisticsPermissions, deleteLogistics);

router.post('/pay', logisticsPermissions, processPayment);


module.exports = router;