const express = require('express');
const router = express.Router();
const { 
    createLogistics, 

} = require('../controllers/logisticsController');

// Route to create a logistics option (pickup or delivery)
router.post('/create', createLogistics);

module.exports = router;
