const express = require('express');
const AppRouter = express.Router();
const appointmentController = require('../Controllers/appointmentController');
const { auth } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');
const Department = require('../Models/departmentModel');
const Doctor = require('../Models/doctorModel');

const validateAppointment = (req, res, next) => {
  const { doctorID, patientID, date, startingHour, reason } = req.body;
  
  if (!doctorID) {
    return res.status(400).json({
      success: false,
      message: 'Doctor ID is required'
    });
  }
  
  if (!patientID) {
    return res.status(400).json({
      success: false,
      message: 'Patient ID is required'
    });
  }
  
  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'Date is required'
    });
  }
  
  if (!startingHour) {
    return res.status(400).json({
      success: false,
      message: 'Starting hour is required'
    });
  }
  
  if (!reason || reason.length < 5) {
    return res.status(400).json({
      success: false,
      message: 'Reason is required and must be at least 5 characters'
    });
  }
  
  next();
};

// Middleware to validate MongoDB ObjectId
const validateObjectId = (req, res, next) => {
  const { id, doctorID, patientID } = req.params;
  const mongoose = require('mongoose');
  
  const idToCheck = id || doctorID || patientID;
  
  if (idToCheck && !mongoose.Types.ObjectId.isValid(idToCheck)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  next();
};

// API Routes
AppRouter.post('/', validateAppointment, appointmentController.createAppointment);
AppRouter.get('/', appointmentController.getAllAppointments);
AppRouter.get('/today', appointmentController.getTodayAppointments);
AppRouter.get('/date-range', appointmentController.getAppointmentsByDateRange);

// View Routes (placed before dynamic ID routes)
AppRouter.get('/book', async (req, res) => {
    try {
        const doctorId = req.query.doctor; 
        let selectedDoctor = null;
        if (doctorId) {
            selectedDoctor = await Doctor.findById(doctorId)
                .populate('userId', 'FName LName')
                .populate('departmentId', 'departmentName');
        }

        // Fetch all doctors for the dropdown
        const doctors = await Doctor.find()
            .populate('userId', 'FName LName')
            .populate('departmentId', 'departmentName');

        const departments = await Department.find();

        let user = null;
        try {
            const token = req.cookies?.token;
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(decoded.id).select('-Password');
            }
        } catch (error) {
            console.log('Token verification failed:', error.message);
        }

        res.render('bookAppointment', {
            departments,
            user,
            selectedDoctor,
            doctors,
            currentPage: 'book'
        });
    } catch (error) {
        console.error("Error rendering book appointment page:", error);
        res.status(500).send("Error loading booking page.");
    }
});

AppRouter.get('/quick-appointment', async (req, res) => {
    try {
        const departments = await Department.find();
        // Fetch all doctors for the dropdown
        const doctors = await Doctor.find()
            .populate('userId', 'FName LName')
            .populate('departmentId', 'departmentName');

        let user = null;
        try {
            const token = req.cookies?.token;
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(decoded.id).select('-Password');
            }
        } catch (error) {
            console.log('Token verification failed:', error.message);
        }
        res.render('quickAppointment', { departments, user, doctors, currentPage: 'appointments' });
    } catch (error) {
        console.error("Error rendering quick appointment page:", error);
        res.status(500).send("Error loading quick appointment page.");
    }
});

// API Routes (dynamic ID routes come after specific view routes)
AppRouter.get('/:id', validateObjectId, appointmentController.getAppointmentById);
AppRouter.get('/doctor/:doctorID', validateObjectId, appointmentController.getAppointmentsByDoctor);
AppRouter.get('/patient/:patientID', validateObjectId, appointmentController.getAppointmentsByPatient);
AppRouter.put('/:id', validateObjectId, appointmentController.updateAppointment);
AppRouter.patch('/:id/status', validateObjectId, appointmentController.updateAppointmentStatus);
AppRouter.delete('/:id', validateObjectId, appointmentController.deleteAppointment);

// View Routes
AppRouter.get('/', async (req, res) => {
    try {
        let user = null;
        try {
            const token = req.cookies?.token;
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(decoded.id).select('-Password');
            }
        } catch (error) {
            console.log('Token verification failed:', error.message);
        }
        res.render('appointmentPage', { user });
    } catch (error) {
        console.error("Error rendering appointments page:", error);
        res.status(500).send("Error loading appointments page.");
    }
});

module.exports = AppRouter;