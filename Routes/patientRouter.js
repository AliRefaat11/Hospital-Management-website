const express = require('express');
const router = express.Router();
const patientController = require('../Controllers/patientController');
const authMiddleware = require('../middleware/auth');
router.get('/', authMiddleware, patientController.getAllPatients); // List all patients
router.get('/:id', authMiddleware, patientController.getPatientById); // Get a specific patient by ID
router.post('/', authMiddleware, patientController.addPatient); // Add a new patient
router.put('/:id', authMiddleware, patientController.updatePatient); // Update a patient's information
router.delete('/:id', authMiddleware, patientController.deletePatient); // Delete a patient by ID

module.exports = router;
