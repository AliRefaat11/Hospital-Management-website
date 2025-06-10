const express = require('express');
const PatRouter = express.Router();
const patientController = require('../Controllers/patientController');

PatRouter.get('/', patientController.getAllPatients);
PatRouter.post('/', patientController.createPatient);
PatRouter.get('/:id', patientController.getPatientById);
PatRouter.put('/:id', patientController.updatePatient);
PatRouter.delete('/:id', patientController.deletePatient);
PatRouter.post('/signup',patientController.signup);

module.exports = PatRouter; 