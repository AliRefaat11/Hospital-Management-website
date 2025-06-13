const express = require("express");
const DrRouter = express.Router();
const DocController = require("../Controllers/doctorController");
const { auth } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');
const Doctor = require('../Models/doctorModel');

// View Routes (prioritized)
DrRouter.get('/', async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .populate('userId', 'FName LName Email PhoneNumber Gender Age')
            .populate('departmentId', 'name');

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

        const hospital = {
            name: "PrimeCare",
            address: "123 Health St, Wellness City",
            phone: "+1234567890",
            email: "info@primecare.com"
        };

        const pageContent = {
            heroTitle: "Meet Our Expert Doctors",
            heroSubtitle: "Our team of highly skilled and compassionate doctors is here to provide you with the best care possible."
        };

        const footerLinks = [
            { url: "/", text: "Home" },
            { url: "/User/about", text: "About Us" },
            { url: "/Department/view", text: "Departments" },
            { url: "/doctors", text: "Doctors" },
            { url: "/appointments", text: "Book Appointment" }
        ];

        const socialLinks = [
            { url: "#", icon: "fab fa-facebook" },
            { url: "#", icon: "fab fa-twitter" },
            { url: "#", icon: "fab fa-instagram" },
            { url: "#", icon: "fab fa-linkedin" }
        ];

        res.render('doctors_page', {
            doctors,
            user,
            hospital,
            currentPage: 'doctors',
            pageContent,
            searchQuery: '',
            footerLinks,
            socialLinks
        });
    } catch (error) {
        console.error('Error loading doctors page:', error);
        res.status(500).send('Error loading doctors page');
    }
});

// API Routes
DrRouter.get("/search", DocController.search);
DrRouter.get("/:id", DocController.getById);
DrRouter.delete("/:id", DocController.deleteById);
DrRouter.get("/department/:departmentId", DocController.getByDepartment);
DrRouter.get("/specialization/:specialization", DocController.getBySpecialization);

module.exports = DrRouter;