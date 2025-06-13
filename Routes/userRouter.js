const express = require("express");
const UserRouter = express.Router();
const UserController = require("../Controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

UserRouter.post("/signup", UserController.create);
UserRouter.post("/login", UserController.login);

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

        if (user.role === 'Patient') {
            const patient = await Patient.findOne({ userId: user._id });
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
        } else {
            // For other roles or if role is not defined, redirect to home or a generic dashboard
            res.redirect('/'); 
        }
    } catch (err) {
        console.error('Error loading profile page:', err);
        next(err);
    }
});

// API Routes
UserRouter.get("/profile", UserController.getProfile);
UserRouter.patch("/profile", UserController.update);
UserRouter.patch("/profile/password", UserController.updatePassword);

// Admin only routes
UserRouter.use(allowedTo('Admin')); // Apply admin role check to all routes below
UserRouter.get("/", UserController.getAll);
UserRouter.get("/:id", UserController.getById);
UserRouter.patch("/:id", validateRequest(updateValidation), UserController.update);
UserRouter.delete("/:id", UserController.deleteById);
UserRouter.patch("/:id/password", validateRequest(updatePasswordValidation), UserController.updatePassword);

module.exports = UserRouter;