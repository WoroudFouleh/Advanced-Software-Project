// routes/seasonRoutes.js
const express = require("express");
const router = express.Router();
const seasonController = require('../controllers/seasonController');
const checkPermissions = require('../middleware/checkPermissions');

router.post('/add', checkPermissions, seasonController.createSeason);
router.get('/list', checkPermissions,seasonController.getAllSeasons); 
router.put('/update/:id', checkPermissions, seasonController.updateSeason); 
router.delete('/delete/:id', checkPermissions, seasonController.deleteSeason); 

module.exports = router;
