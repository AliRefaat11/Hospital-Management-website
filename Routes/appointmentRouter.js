const express = require('express');
const AppRouter = express.Router();
const appointmentController = require('../Controllers/appointmentController');
const { auth, ApiError } = require('../middleware/authMiddleware');
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

// View Routes (placed before API routes)
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

        if (!user) {
            // If no user is logged in, redirect to login page
            return res.redirect('/User/login');
        }

        if (user.role === 'Patient') {
            // If it's a patient, redirect them to their profile page which shows appointments
            return res.redirect('/User/profile');
        } else if (user.role === 'Admin') {
            // If it's an admin, proceed to render appointmentsManagement
            // You need to fetch admin data here for the appointmentsManagement.ejs
            const admin = user; // Assuming user object contains admin details or you fetch them here
            
            // Fetch doctors for the dropdown in appointmentsManagement.ejs
            const doctors = await Doctor.find()
                .populate('userId', 'FName LName')
                .populate('departmentId', 'departmentName');

            // Placeholder data for stats, departments, etc. You should fetch real data here.
            res.render('appointmentsManagement', {
                user,
                admin, // Pass admin object for admin view
                currentPage: 'appointments',
                siteName: 'PrimeCare',
                stats: {
                    total: { count: 0, changeType: 'neutral', changePercent: 0 },
                    today: { count: 0 },
                    completed: { count: 0 },
                    pending: { count: 0 }
                },
                departments: [], // Fetch real departments
                appointments: [], // Fetch real appointments for admin view
                todaySchedule: {
                    urgent: 0,
                    late: 0,
                    noShows: 0,
                    avgWaitTime: '0 min'
                },
                nextAppointments: [],
                notifications: { count: 0 },
                messages: { count: 0 },
                doctors, // Pass the fetched doctors to the template
                appointmentTypes: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show']
            });
        } else {
            // For other roles, redirect to home or an appropriate page
            return res.redirect('/');
        }
    } catch (error) {
        console.error("Error rendering appointments page:", error);
        res.status(500).send("Error loading appointments page.");
    }
});

AppRouter.get('/book', async (req, res) => {
    console.log('GET /appointments/book route hit');
    try {
        const doctorId = req.query.doctor; 
        console.log('Doctor ID from query:', doctorId);
        
        let selectedDoctor = null;
        if (doctorId) {
            selectedDoctor = await Doctor.findById(doctorId)
                .populate('userId', 'FName LName')
                .populate('departmentId', 'departmentName')
                .select('+weeklySchedule')
                .lean(); 
            console.log('Selected doctor:', selectedDoctor);
        }

        // Fetch all doctors for the dropdown
        const doctors = await Doctor.find()
            .populate('userId', 'FName LName')
            .populate('departmentId', 'departmentName')
            .select('+weeklySchedule')
            .lean();
        console.log('Number of doctors fetched:', doctors.length);

        const departments = await Department.find();
        console.log('Number of departments fetched:', departments.length);

        let user = null;
        try {
            const token = req.cookies?.token;
            console.log('Token from cookies:', token ? 'Present' : 'Not present');
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(decoded.id).select('-Password');
                console.log('User found:', user ? 'Yes' : 'No');
            }
        } catch (error) {
            console.log('Token verification failed:', error.message);
        }

        console.log('Rendering bookAppointment.ejs');
        res.render('bookAppointment', {
            departments,
            user,
            selectedDoctor,
            doctors,
            currentPage: 'book',
            siteName: 'PrimeCare'
        });
    } catch (error) {
        console.error("Error rendering book appointment page:", error);
        res.status(500).send("Error loading booking page.");
    }
});

AppRouter.post('/book', auth, async (req, res, next) => {
    try {
        console.log('Received body in /appointments/book POST:', req.body);
        const { doctor, date, startingHour, reason } = req.body;
        const patientID = req.user.id; // Get from auth middleware

        // Validate required fields (moved to controller or middleware for cleaner route)
        if (!doctor || !date || !startingHour || !reason) {
            return next(new ApiError('All fields are required', 400));
        }

        // Create appointment
        await appointmentController.createAppointment(req, res);

    } catch (error) {
        console.error('Error booking appointment:', error);
        // Only send a response if one hasn't been sent by the controller already
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Failed to book appointment',
                error: error.message
            });
        }
    }
});

AppRouter.get('/quick-appointment', async (req, res) => {
    try {
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
        res.render('quickAppointment', { 
            departments, 
            user, 
            currentPage: 'appointments',
            siteName: 'PrimeCare'
        });
    } catch (error) {
        console.error("Error rendering quick appointment page:", error);
        res.status(500).send("Error loading quick appointment page.");
    }
});

// API Routes
AppRouter.post('/', auth, validateAppointment, appointmentController.createAppointment);
AppRouter.get('/api', auth, appointmentController.getAllAppointments);
AppRouter.get('/api/today', auth, appointmentController.getTodayAppointments);
AppRouter.get('/api/date-range', auth, appointmentController.getAppointmentsByDateRange);
AppRouter.get('/api/:id', auth, validateObjectId, appointmentController.getAppointmentById);
AppRouter.get('/api/doctor/:doctorID', auth, validateObjectId, appointmentController.getAppointmentsByDoctor);
AppRouter.get('/api/patient/:patientID', auth, validateObjectId, appointmentController.getAppointmentsByPatient);
AppRouter.put('/api/:id', auth, validateObjectId, appointmentController.updateAppointment);
AppRouter.patch('/api/:id/status', auth, validateObjectId, appointmentController.updateAppointmentStatus);
AppRouter.delete('/api/:id', auth, validateObjectId, appointmentController.deleteAppointment);

module.exports = AppRouter;