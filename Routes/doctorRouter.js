const express = require("express");
const DrRouter = express.Router();
const DocController = require("../Controllers/doctorController");
const { auth } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');
const Doctor = require('../Models/doctorModel');
const Department = require('../Models/departmentModel');

// View Routes (prioritized for root /doctors)
DrRouter.get('/', async (req, res) => {
    console.log('Accessing /doctors route.');
    try {
        const doctors = await Doctor.find()
            .populate('userId', 'FName LName Email PhoneNumber Gender Age')
            .populate('departmentId', 'departmentName');

        console.log('Doctors fetched from DB (with populated departmentId):', doctors.map(doc => ({
            _id: doc._id,
            specialization: doc.specialization,
            department: doc.departmentId ? doc.departmentId.departmentName : 'Department Missing' // Debugging department access
        })));

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

        // --- ADDED DEBUG LOG ---
        // Log the populated doctors data to see the structure of departmentId
        if (doctors.length > 0) {
            console.log('Debug: First doctor departmentId data:', doctors[0].departmentId);
        } else {
            console.log('Debug: No doctors found in the database.');
        }
        // --- END DEBUG LOG ---

        const hospital = {
            name: "PrimeCare",
            address: "123 Health St, Wellness City",
            phone: "+1234567890",
            email: "info@primecare.com"
        };
        const currentPage = 'doctors';
        const pageContent = {
            heroTitle: "Meet Our Expert Doctors",
            heroSubtitle: "Our team of highly skilled and compassionate doctors is here to provide you with the best care possible."
        };
        const searchQuery = '';
        const footerLinks = [
            { url: "/", text: "Home" },
            { url: "/User/about", text: "About Us" },
            { url: "/Department/view", text: "Departments" },
            { url: "/doctors", text: "Doctors" },
            { url: "/appointments", text: "Book Appointment" }
        ];
        const socialLinks = [
            { url: "#", icon: `<i class="fab fa-facebook-f"></i>` },
            { url: "#", icon: `<i class="fab fa-twitter"></i>` },
            { url: "#", icon: `<i class="fab fa-instagram"></i>` }
        ];

        res.render('doctorPage', {
            hospital,
            user,
            currentPage,
            pageContent,
            searchQuery,
            doctors,
            footerLinks,
            socialLinks
        });
    } catch (error) {
        console.error("Error rendering doctors page:", error);
        res.status(500).send("Error loading doctors page.");
    }
});

// API Routes
DrRouter.get("/api/doctors", DocController.getAll);
DrRouter.get("/search", DocController.search);
DrRouter.post("/", DocController.create);
DrRouter.get("/:id", DocController.getById);
DrRouter.delete("/:id", DocController.deleteById);
DrRouter.get("/department/:departmentId", DocController.getByDepartment);
DrRouter.get("/specialization/:specialization", DocController.getBySpecialization);

DrRouter.get('/manage', auth, async (req, res) => {
    try {
        console.log('Accessing /doctors/manage route.');
        console.log('req.user from auth middleware:', req.user);

        // Get all doctors with populated user and department info
        const doctors = await Doctor.find()
            .populate('userId', 'FName LName Email PhoneNumber Gender Age')
            .populate('departmentId', 'departmentName');

        // Get all departments for the dropdown
        const departments = await Department.find();

        // Get unique specializations from doctors
        const specializations = await Doctor.distinct('specialization');

        // Get admin info from the authenticated user
        let admin = {
            _id: null,
            FName: 'Guest',
            LName: 'Admin',
            name: 'Guest Admin',
            Email: 'guest@example.com',
            PhoneNumber: '',
            Gender: '',
            Age: null,
            role: 'System Administrator',
            profileImage: '/images/admin-avatar.png'
        }; // Initialize with default values

        if (req.user) { // req.user should be set by auth middleware if authenticated
            // Directly use req.user properties, filling in defaults if missing
            admin._id = req.user._id;
            admin.FName = req.user.FName;
            admin.LName = req.user.LName;
            admin.name = `${req.user.FName || ''} ${req.user.LName || ''}`.trim() || 'Admin';
            admin.Email = req.user.Email;
            admin.PhoneNumber = req.user.PhoneNumber;
            admin.Gender = req.user.Gender;
            admin.Age = req.user.Age;
            admin.role = req.user.Role || 'System Administrator'; // Use 'Role' from user model
            admin.profileImage = req.user.profileImage || '/images/admin-avatar.png';
        }
        console.log('Admin object prepared for EJS:', admin);

        // Calculate real statistics
        const stats = {
            totalDoctors: doctors.length,
            doctorsChange: 5, // You can calculate this based on historical data
            activeDoctors: doctors.filter(doc => doc.status === 'active').length,
            specialistDoctors: doctors.filter(doc => doc.specialization !== 'General Practitioner').length,
            generalDoctors: doctors.filter(doc => doc.specialization === 'General Practitioner').length
        };

        // Get recent activities (you can store these in a separate collection later)
        const activities = [
            { icon: 'fa-plus-circle', description: 'New doctor added', timestamp: new Date() },
            { icon: 'fa-edit', description: 'Doctor information updated', timestamp: new Date() }
        ];

        // Employment types for the form
        const employmentTypes = ['Full-Time', 'Part-Time', 'Contract', 'Intern'];

        res.render('doctorManagement', {
            doctors,
            departments,
            specializations,
            employmentTypes,
            admin,
            stats,
            activities,
            currentPage: 'doctors-management'
        });
    } catch (error) {
        console.error("Error rendering doctor management page:", error);
        res.status(500).send("Error loading doctor management page.");
    }
});

// Temporary debugging route to render doctorManagement.ejs with dummy data (bypasses auth)
DrRouter.get('/test-manage', async (req, res) => {
    try {
        console.log('Accessing /doctors/test-manage route (DEBUGGING).');

        // Dummy data for testing
        const doctors = [
            {
                _id: '60c72b2f9f1b2c001c8e4d3a',
                userId: { FName: 'John', LName: 'Doe', Email: 'john.doe@example.com' },
                departmentId: { departmentName: 'Cardiology' },
                specialization: 'Cardiologist',
                lastActive: new Date(),
                status: 'active'
            },
            {
                _id: '60c72b2f9f1b2c001c8e4d3b',
                userId: { FName: 'Jane', LName: 'Smith', Email: 'jane.smith@example.com' },
                departmentId: { departmentName: 'Neurology' },
                specialization: 'Neurologist',
                lastActive: new Date(),
                status: 'on-leave'
            }
        ];

        const departments = [
            { _id: 'dep1', departmentName: 'Cardiology' },
            { _id: 'dep2', departmentName: 'Neurology' }
        ];
        const specializations = ['Cardiologist', 'Neurologist', 'General Practitioner'];
        const employmentTypes = ['Full-Time', 'Part-Time'];

        const admin = {
            _id: 'admin123',
            FName: 'Test',
            LName: 'Admin',
            name: 'Test Admin',
            Email: 'test.admin@example.com',
            PhoneNumber: '123-456-7890',
            Gender: 'Male',
            Age: 30,
            role: 'Admin',
            profileImage: '/images/admin-avatar.png'
        };

        const stats = {
            totalDoctors: doctors.length,
            doctorsChange: 10,
            activeDoctors: doctors.filter(d => d.status === 'active').length,
            specialistDoctors: doctors.filter(d => d.specialization !== 'General Practitioner').length,
            generalDoctors: doctors.filter(d => d.specialization === 'General Practitioner').length
        };

        const activities = [
            { icon: 'fa-plus-circle', description: 'Dummy Doctor added', timestamp: new Date() },
            { icon: 'fa-edit', description: 'Dummy Doctor updated', timestamp: new Date() },
        ];

        res.render('doctorManagement', {
            doctors,
            departments,
            specializations,
            employmentTypes,
            admin,
            stats,
            activities,
            currentPage: 'doctors-management'
        });

    } catch (error) {
        console.error("Error rendering test doctor management page:", error);
        res.status(500).send("Error loading test doctor management page.");
    }
});

module.exports = DrRouter;