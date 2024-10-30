// insuranceRoutes.js
const express = require('express');
const router = express.Router();
const checkPermissions = require('../middleware/checkPermissions');
const insuranceController = require('../controllers/insuranceController'); // Adjust the path as needed

// Route to get all insurance records
router.get('/insurance', checkPermissions,insuranceController.getAllInsurance);

// Route to delete an insurance record by ID
router.delete('/insurance',checkPermissions, insuranceController.deleteInsuranceById);

module.exports = router;
