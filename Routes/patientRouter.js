const express = require('express');
const PatRouter = express.Router();
const patientController = require('../Controllers/patientController');
const { auth, allowedTo } = require('../middleware/authMiddleware');

// Authentication routes
PatRouter.post('/signup', patientController.signup);
PatRouter.get('/signup', (req, res) => {
    res.render('signupPage', { 
        title: 'Patient Sign Up',
        formTitle: 'Create Patient Account',
        currentPage: 'signup',
        siteName: 'PrimeCare',
        role: 'Patient'
    });
});

PatRouter.use(auth);
PatRouter.get("/me", patientController.getLoggedPatientData);
PatRouter.get('/:id', allowedTo('Patient', 'Admin'), patientController.getPatientById);

// Admin only routes
PatRouter.use(allowedTo('Admin'));
PatRouter.get('/', patientController.getAllPatients);
PatRouter.post('/', patientController.createPatient);
PatRouter.put('/:id', patientController.updatePatient);
PatRouter.delete('/:id', patientController.deletePatient);

module.exports = PatRouter; 