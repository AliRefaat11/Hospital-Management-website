const express = require('express');
const router = express.Router();
const insuranceController = require('../Controllers/insuranceController');

// GET all insurances
router.get('/', insuranceController.getAllInsurances);

// GET a single insurance by ID
router.get('/:id', insuranceController.getInsuranceById);

// CREATE a new insurance
router.post('/', insuranceController.createInsurance);

// UPDATE an existing insurance
router.put('/:id', insuranceController.updateInsurance);

// DELETE an insurance
router.delete('/:id', insuranceController.deleteInsurance);

module.exports = InsurRouter; 