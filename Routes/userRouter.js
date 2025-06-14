const express = require("express");
const UserRouter = express.Router();
const UserController = require("../Controllers/userController");
const { auth, allowedTo } = require("../middleware/authMiddleware");
const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');
const Patient = require('../Models/patientModel');
const Doctor = require('../Models/doctorModel');
const Department = require('../Models/departmentModel');
const Appointment = require('../Models/appointmentModel');

UserRouter.post("/signup", UserController.create);
UserRouter.post("/login", UserController.login);

UserRouter.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/User/login');
});

UserRouter.get('/login', async (req, res) => {
    res.render('loginPage', {
        title: 'Patient Login',
        formTitle: 'Login to PrimeCare',
        currentPage: 'login',
        siteName: 'PrimeCare'
    });
});

// Protected routes (require authentication)
UserRouter.use(auth);

// View Routes (Protected)
UserRouter.get('/edit-profile', async (req, res, next) => {
    try {
        const user = req.user;
        let patient = null;

        if (user.role === 'Patient') {
            patient = await Patient.findOne({ userId: user._id });
        }

        res.render('editprofilePage', {
            currentPage: 'edit-profile',
            user: user,
            patient: patient
        });
    } catch (err) {
        console.error('Error loading edit profile page:', err);
        next(err);
    }
});

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

UserRouter.get('/profile', async (req, res) => {
    try {
        const user = req.user;

        if (user.role === 'Patient') {
            const patient = await Patient.findOne({ userId: user._id }).populate({
                path: 'appointments',
                populate: {
                    path: 'doctorID',
                    select: 'FName LName specialization'
                }
            });
            if (!patient) {
                return res.status(404).send('Patient profile not found');
            }
            // Optionally fetch doctors as in your API logic
            let doctors = await Doctor.find();
            let doctorList = await Promise.all(
                doctors.map(async (doctor) => {
                    const doctorUser = await User.findById(doctor.userId);
                    return {
                        firstname: doctorUser.FName,
                        lastname: doctorUser.LName,
                        specialization: doctor.specialization,
                        rating: doctor.rating,
                        email: doctorUser.Email,
                    };
                })
            );
            res.render('profilePage', {
                user,
                patient,
                doctors: doctorList,
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
        } else if (user.role === 'Admin') {
            res.redirect('/User/adminProfile');
        } else {
            res.redirect('/'); 
        }
    } catch (err) {
        console.error('Error loading profile page:', err);
        next(err);
    }
});

UserRouter.get('/settings', async (req, res, next) => {
    try {
        const user = req.user;
        res.render('settingsProfile', {
            currentPage: 'settings',
            user: user,
            title: 'Settings',
            pageTitle: 'Settings'
        });
    } catch (err) {
        console.error('Error loading settings page:', err);
        next(err);
    }
});

// API Routes
UserRouter.get("/profile", UserController.getProfile);
UserRouter.patch("/profile", UserController.update);
UserRouter.patch("/profile/password", UserController.updatePassword);

// Admin only routes
UserRouter.get('/adminProfile', allowedTo('Admin'), async (req, res, next) => {
    try {
        const admin = req.user;

        // Fetch actual data from the database
        const totalDoctors = await Doctor.countDocuments();
        // Assuming 'active' doctors are simply all doctors for now. Adjust if there's an 'isActive' field.
        const activeDoctors = totalDoctors; 
        const specialists = await Doctor.distinct('specialization').countDocuments();
        const allDepartments = await Department.find();
        const departmentCount = allDepartments.length;

        // You would need to implement logic to calculate these from your Appointment model
        // and Doctor schedules.
        const todayAppointments = 45; // Placeholder
        const appointmentsChange = -2; // Placeholder
        const onDutyDoctors = 15; // Placeholder
        const averageRating = (await Doctor.aggregate([{$group: {_id: null, avgRating: {$avg: '$rating'}}}]).then(res => res[0]?.avgRating || 0)).toFixed(1); // Calculate average rating
        const ratingChange = 0.1; // Placeholder
        const availableDoctors = 90; // Placeholder
        const coverageRate = ((availableDoctors / totalDoctors) * 100).toFixed(0); // Calculate coverage rate
        const onTimeRate = 85; // Placeholder
        const availableSlots = 120; // Placeholder

        const departmentsData = await Promise.all(allDepartments.map(async (dept) => {
            const totalDeptDoctors = await Doctor.countDocuments({ departmentId: dept._id });
            // For 'availableDoctors', you might need to check schedules or a specific status
            const availableDeptDoctors = Math.floor(totalDeptDoctors * 0.75); // Placeholder: 75% are available
            return {
                name: dept.departmentName,
                totalDoctors: totalDeptDoctors,
                availableDoctors: availableDeptDoctors
            };
        }));

        const notifications = {
            unreadCount: 5
        };
        const messages = {
            unreadCount: 3
        };

        const stats = {
            activeDoctors,
            doctorsChange: 5,
            todayAppointments,
            appointmentsChange,
            onDutyDoctors,
            averageRating: parseFloat(averageRating),
            ratingChange,
            specialists,
            departmentCount,
            availableDoctors,
            totalDoctors,
            coverageRate: parseFloat(coverageRate),
            onTimeRate
        };

        const systemStatus = [
            { name: 'Doctor Portal', status: 'Active' },
            { name: 'Scheduling System', status: 'Operational' },
            { name: 'Access Control', status: 'Secured' }
        ];

        res.render('adminProfile', {
            title: 'Admin Profile',
            currentPage: 'adminProfile',
            admin, // Pass the admin user object
            notifications,
            messages,
            stats,
            departments: departmentsData, // Pass the processed department data
            systemStatus,
            csrfToken: ''
        });
    } catch (err) {
        console.error('Error loading admin profile page:', err);
        next(err);
    }
});

UserRouter.get("/", UserController.getAll);
UserRouter.get("/:id", UserController.getById);
UserRouter.patch("/:id", UserController.update);
UserRouter.delete("/:id", UserController.deleteById);
UserRouter.patch("/:id/password", UserController.updatePassword);

module.exports = UserRouter;
