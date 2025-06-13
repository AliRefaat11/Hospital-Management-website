const express = require("express");
const UserRouter = express.Router();
const UserController = require("../Controllers/userController");
const { auth, allowedTo } = require("../middleware/authMiddleware");
<<<<<<< HEAD
const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');
const Patient = require('../Models/patientModel');
const Doctor = require('../Models/doctorModel');
const path = require('path');
=======
>>>>>>> 99de3df2183c3bdf5d283e3f000943eea2e2ee8a

// Public routes (no auth needed)
UserRouter.post("/signup", UserController.create);
UserRouter.post("/login", UserController.login);

<<<<<<< HEAD
// Logout route
UserRouter.get('/logout', (req, res) => {
    res.clearCookie('token'); // Clear the JWT token cookie
    res.redirect('/User/login'); // Redirect to login page
});

// View Routes (Public - no auth needed)
UserRouter.get('/login', async (req, res) => {
    res.render('loginPage', {
        title: 'Patient Login',
        formTitle: 'Login to PrimeCare',
        currentPage: 'login',
        siteName: 'PrimeCare'
    });
});

// New Public View Routes
UserRouter.get('/privacy-policy', async (req, res) => {
    res.render('privacyPolicy', {});
});

UserRouter.get('/terms-of-service', async (req, res) => {
    res.render('termsOfService', {});
});

UserRouter.get('/contact-us', async (req, res) => {
    res.render('contactUs', {});
});

// View Routes
UserRouter.get('/about', async (req, res) => {
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

        const aboutUsSections = [
            {
                title: "Our Mission",
                content: "To provide compassionate, high-quality healthcare services to our community, fostering wellness and promoting a healthier future for all."
            },
            {
                title: "Our Vision",
                content: "To be the leading healthcare provider, recognized for our excellence in patient care, innovative medical practices, and commitment to community health."
            },
            {
                title: "Our Values",
                list: [
                    "Patient-Centered Care: Prioritizing the needs and well-being of our patients.",
                    "Excellence: Striving for the highest standards in medical care and service.",
                    "Integrity: Upholding honesty, ethics, and transparency in all our actions.",
                    "Teamwork: Collaborating effectively to deliver comprehensive and coordinated care.",
                    "Innovation: Embracing new technologies and approaches to improve health outcomes."
                ]
            }
        ];

        res.render('aboutusPage', {
            currentPage: 'about',
            siteName: 'Prime Care',
            user,
            aboutUsSections
        });
    } catch (error) {
        console.error("Error rendering about page:", error);
        res.status(500).send("Error loading about page.");
    }
});

// Protected routes (require authentication)
UserRouter.use(auth); // Apply auth middleware to all routes below

// View Routes (Protected)
UserRouter.get('/profile', async (req, res) => {
    try {
        const user = req.user;
        console.log('DEBUG Logged-in User ID:', user._id);
        console.log('DEBUG Logged-in User Role:', user.role);

        if (user.role === 'Patient') {
            const patient = await Patient.findOne({ userId: user._id });
            console.log('DEBUG Found Patient ID:', patient ? patient._id : 'Not found');
            if (!patient) {
                return res.status(404).send('Patient profile not found');
            }
            // Fetch upcoming appointments
            const now = new Date();
            const Appointment = require('../Models/appointmentModel');
            const appointments = await Appointment.find({
                patientID: patient._id,
                date: { $gte: now }
            })
            .populate({
                path: 'doctorID',
                populate: { path: 'userId', select: 'FName LName' }
            })
            .sort({ date: 1 });
            console.log('DEBUG Fetched Appointments:', appointments.length, 'appointments');

            res.render('profilePage', {
                user,
                patient,
                appointments,
                currentPage: 'profile'
            });
        } else if (user.role === 'Doctor') {
            const doctor = await Doctor.findOne({ userId: user._id })
                .populate('userId', 'FName LName Email PhoneNumber Gender Age')
                .populate('departmentId', 'departmentName');
            
            if (!doctor) {
                return res.status(404).send('Doctor profile not found');
            }

            const hospital = {
                name: "PrimeCare",
                address: "123 Health St, Wellness City",
                phone: "+1234567890",
                email: "info@primecare.com"
            };

            res.render('doctorProfile', {
                user,
                doctor,
                hospital,
                currentPage: 'profile'
            });
        } else {
            // For other roles or if role is not defined, redirect to home or a generic dashboard
            res.redirect('/'); 
        }
    } catch (err) {
        console.error('Error loading profile page:', err);
        next(err);
    }
});

// Edit Profile Page
UserRouter.get('/edit', auth, async (req, res) => {
    try {
        const user = req.user;
        let patient = null;

        if (user.role === 'Patient') {
            patient = await Patient.findOne({ userId: user._id });
            // No need to check if !patient here, as the EJS handles it with ternary operator
        }

        res.render('editprofilePage', {
            user,
            patient, // Pass patient data (will be null for non-patients)
            currentPage: 'edit'
        });
    } catch (error) {
        console.error('Error rendering edit profile page:', error);
        res.status(500).send('Error loading edit profile page.');
    }
});

// Settings Page
UserRouter.get('/settings', auth, async (req, res) => {
    try {
        const user = req.user || {};
        // You can fetch user-specific settings from DB if you have them, here we use defaults
        const userSettings = {
            emailNotifications: false,
            smsNotifications: false,
            privateProfile: false
        };
        res.render('settingsProfile', {
            user,
            currentPage: 'settings',
            title: 'Settings - PrimeCare',
            pageTitle: 'Settings',
            submitText: 'Save Settings',
            userSettings,
            successMessage: '',
            errorMessage: '',
            showPasswordSection: true,
            additionalSettings: [],
            showDangerZone: false,
            backUrl: '/User/profile'
        });
    } catch (error) {
        console.error('Error rendering settings page:', error);
        res.status(500).send('Error loading settings page.');
    }
});

// API Routes
UserRouter.get("/profile", UserController.getProfile);
UserRouter.patch("/profile", UserController.update);
UserRouter.patch("/profile/update", UserController.updateProfile);
UserRouter.patch("/profile/password", UserController.updatePassword);

=======
// Protected routes (require authentication)
UserRouter.use(auth); // Apply auth middleware to all routes below
// Routes accessible by the user themselves
UserRouter.get("/profile", UserController.getProfile);
UserRouter.patch("/profile", UserController.update);
UserRouter.patch("/profile/password", UserController.updatePassword);
>>>>>>> 99de3df2183c3bdf5d283e3f000943eea2e2ee8a
// Admin only routes
UserRouter.use(allowedTo('Admin')); // Apply admin role check to all routes below
UserRouter.get("/", UserController.getAll);
UserRouter.get("/:id", UserController.getById);
UserRouter.patch("/:id", UserController.update);
UserRouter.delete("/:id", UserController.deleteById);
UserRouter.patch("/:id/password", UserController.updatePassword);

<<<<<<< HEAD
// Admin Doctor Management Page
UserRouter.get('/admin/doctors', auth, allowedTo('Admin'), async (req, res, next) => {
    try {
        const admin = req.user; // Assuming req.user contains admin data
        const doctors = await Doctor.find()
            .populate('userId', 'FName LName Email PhoneNumber')
            .populate('departmentId', 'name');

        // Mock stats and activities for now, ideally these would come from a controller
        const stats = {
            totalDoctors: doctors.length,
            activeDoctors: doctors.filter(doc => doc.status === 'Active').length,
            specialistDoctors: doctors.filter(doc => doc.specialization !== 'General Practitioner').length,
            generalDoctors: doctors.filter(doc => doc.specialization === 'General Practitioner').length,
            doctorsChange: 0 // Placeholder
        };
        const activities = []; // Placeholder for recent activities

        res.render('doctorManagement', {
            admin,
            doctors,
            stats,
            activities,
            currentPage: 'doctors'
        });
    } catch (err) {
        console.error('Error rendering doctor management page:', err);
        next(err);
    }
});

=======
>>>>>>> 99de3df2183c3bdf5d283e3f000943eea2e2ee8a
module.exports = UserRouter;