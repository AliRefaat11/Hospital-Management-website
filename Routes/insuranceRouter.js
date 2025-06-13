const express = require('express');
const InsurRouter = express.Router();
const insuranceController = require('../Controllers/insuranceController');

InsurRouter.get('/', insuranceController.getAllInsurances);
InsurRouter.get('/:id', insuranceController.getInsuranceById);
InsurRouter.post('/', insuranceController.createInsurance);
InsurRouter.put('/:id', insuranceController.updateInsurance);
InsurRouter.delete('/:id', insuranceController.deleteInsurance);

module.exports = InsurRouter; 