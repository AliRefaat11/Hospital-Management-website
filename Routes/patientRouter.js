
const express = require('express');
const router = express.Router();
const patientController = require('../Controllers/patientController');
const authMiddleware = require('../middleware/auth');
router.get('/', authMiddleware, patientController.getAllPatients); 
router.get('/:id', authMiddleware, patientController.getPatientById); 
router.post('/', authMiddleware, patientController.addPatient); 
router.put('/:id', authMiddleware, patientController.updatePatient); 
router.delete('/:id', authMiddleware, patientController.deletePatient); 
const express = require("express");
const PatRouter = express.Router();
const PatController = require("../Controllers/patientController");

module.exports = router;
