const express = require('express');
const router = express.Router();
const patientController = require('./controllers/patientController');

// GET all patients
router.get('/', patientController.getAllPatients);

// GET a single patient by ID
router.get('/:id', patientController.getPatientById);

// CREATE a new patient
router.post('/', patientController.createPatient);

// UPDATE an existing patient
router.put('/:id', patientController.updatePatient);

// DELETE a patient
router.delete('/:id', patientController.deletePatient);

module.exports = router; 