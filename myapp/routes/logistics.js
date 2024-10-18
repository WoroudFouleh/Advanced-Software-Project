const express = require('express');
const router = express.Router();
const { 
    createLogistics,
    getLogistics 

} = require('../controllers/logisticsController');

// Route to create a logistics option (pickup or delivery)
router.post('/create', createLogistics);

// Route to get all logistics options
router.get('/', getLogistics);

module.exports = router;
