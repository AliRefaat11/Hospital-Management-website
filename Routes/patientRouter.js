const express = require('express');
const PatRouter = express.Router();
const patientController = require('../Controllers/patientController');
const { auth, allowedTo } = require('../middleware/authMiddleware');

PatRouter.post('/signup', patientController.signup);

PatRouter.use(auth);

PatRouter.get('/:id', patientController.getPatientById);

PatRouter.use(allowedTo('Admin')); // Apply admin role check to all routes below
PatRouter.get('/', patientController.getAllPatients);
PatRouter.post('/', patientController.createPatient);
PatRouter.put('/:id', patientController.updatePatient);
PatRouter.delete('/:id', patientController.deletePatient);

module.exports = PatRouter; 