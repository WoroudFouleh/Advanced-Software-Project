// insuranceRoutes.js
const express = require('express');
const router = express.Router();
const checkPermissions = require('../middleware/checkPermissions');
const insuranceController = require('../controllers/insuranceController'); // Adjust the path as needed

router.get('/insurance', checkPermissions,insuranceController.getAllInsurance);
router.get('/insurance/:user_id', checkPermissions,insuranceController.getInsuranceByUserId);
router.delete('/insurance',checkPermissions, insuranceController.deleteInsuranceById);

module.exports = router;