const express = require('express');
const InsurRouter = express.Router();
const insuranceController = require('../Controllers/insuranceController');

// GET all insurances
InsurRouter.get('/', insuranceController.getAllInsurances);

// GET a single insurance by ID
InsurRouter.get('/:id', insuranceController.getInsuranceById);

// CREATE a new insurance
InsurRouter.post('/', insuranceController.createInsurance);

// UPDATE an existing insurance
InsurRouter.put('/:id', insuranceController.updateInsurance);

// DELETE an insurance
InsurRouter.delete('/:id', insuranceController.deleteInsurance);

module.exports = InsurRouter; 