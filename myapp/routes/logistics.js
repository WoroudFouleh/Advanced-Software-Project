const express = require('express');
const router = express.Router();
const { 
    createLogistics,
    getLogistics,
    getLogisticsById,
    updateLogistics 

} = require('../controllers/logisticsController');

// Route to create a logistics option (pickup or delivery)
router.post('/create', createLogistics);

// Route to get all logistics options
router.get('/', getLogistics);

// Route to get logistics by ID
router.get('/:id', getLogisticsById);

// Update a logistics option
router.put('/:id', updateLogistics);

module.exports = router;
