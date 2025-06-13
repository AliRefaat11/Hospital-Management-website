const Doctor = require("../Models/doctorModel");
const User = require("../Models/userModel");
<<<<<<< HEAD
const Department = require("../Models/departmentModel");
const bcrypt = require('bcryptjs');
const { createToken } = require("../middleware/authMiddleware");
const jwt = require('jsonwebtoken');
=======
const bcrypt = require('bcryptjs');
const { createToken } = require("../middleware/authMiddleware");
>>>>>>> 99de3df2183c3bdf5d283e3f000943eea2e2ee8a

const getAll = async (req, res) => {
    try {
        const doctors = await Doctor.find()
<<<<<<< HEAD
            .populate('userId', 'FName LName Email PhoneNumber Gender Age')
            .populate('departmentId', 'name');
        
=======
            .populate('userId', 'name email')
            .populate('departmentId', 'name');
>>>>>>> 99de3df2183c3bdf5d283e3f000943eea2e2ee8a
        res.status(200).json({
            status: 'success',
            results: doctors.length,
            data: doctors
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const getById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
<<<<<<< HEAD
            .populate('userId', 'FName LName Email PhoneNumber Gender Age')
            .populate('departmentId', 'name');
        
        if (!doctor) {
            return res.status(404).send('Doctor not found');
        }

        let user = null;
        try {
            const token = req.cookies?.token;
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(decoded.id).select('-Password');
            }
        } catch (error) {
            console.log('Token verification failed in doctorController.getById:', error.message);
        }

        const hospital = {
            name: "PrimeCare",
            address: "123 Health St, Wellness City",
            phone: "+1234567890",
            email: "info@primecare.com",
            tagline: "Your Health is Our Priority",
            subTagline: "Providing quality healthcare services for you and your family",
            about: "PrimeCare Hospital is committed to providing exceptional healthcare services with a focus on patient care and medical excellence."
        };

        res.render('doctorProfile', {
            doctor,
            user,
            hospital,
            currentPage: 'doctors',
            siteName: 'PrimeCare'
        });
    } catch (error) {
        console.error("Error fetching doctor profile:", error);
        res.status(500).send("Error loading doctor profile.");
=======
            .populate('userId', 'name email')
            .populate('departmentId', 'name');
        
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'No doctor found with that ID'
            });
        }

        res.status(200).json({
            status: 'success',
            data: doctor
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
>>>>>>> 99de3df2183c3bdf5d283e3f000943eea2e2ee8a
    }
};

const create = async (req, res) => {
    const {FName, LName, Email, Password, Age, PhoneNumber, Gender, specialization, rating, schedule} = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { Email: Email },
                { PhoneNumber: PhoneNumber }
            ]
        });
        
        if (existingUser) {
            return res.status(400).json({
                status: 'fail',
                message: 'User with this email or phone number already exists'
            });
        }
<<<<<<< HEAD
        // Find department by specialization (case-insensitive)
        const department = await Department.findOne({ departmentName: { $regex: specialization, $options: 'i' } });
        if (!department) {
            return res.status(400).json({
                status: 'fail',
                message: `No department found for specialization: ${specialization}`
            });
        }
=======
>>>>>>> 99de3df2183c3bdf5d283e3f000943eea2e2ee8a
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(Password, salt);
        const newUser = await User.create({
            FName,
            LName,
            Email,
            Password: hashedPassword,
            Age,
            PhoneNumber,
            Gender,
            role: "Doctor"
        });
        const newDoctor = await Doctor.create({
            userId: newUser._id,
<<<<<<< HEAD
            departmentId: department._id,
=======
>>>>>>> 99de3df2183c3bdf5d283e3f000943eea2e2ee8a
            specialization,
            rating,
            schedule
        });
        const token = createToken(newUser._id);
        const userResponse = newUser.toObject();
        delete userResponse.Password;
        res.status(201).json({
            status: 'success',
            token,
            data: {
                user: userResponse,
                doctor: newDoctor
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const update = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'No doctor found with that ID'
            });
        }
        res.status(200).json({
            status: 'success',
            data: doctor
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const deleteById = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'No doctor found with that ID'
            });
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const getByDepartment = async (req, res) => {
    try {
        const doctors = await Doctor.find({ departmentId: req.params.departmentId })
            .populate('userId', 'name email')
            .populate('departmentId', 'name');

        res.status(200).json({
            status: 'success',
            results: doctors.length,
            data: doctors
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const getBySpecialization = async (req, res) => {
    try {
        const doctors = await Doctor.find({ specialization: req.params.specialization })
<<<<<<< HEAD
            .populate('userId', 'FName LName email')
=======
            .populate('userId', 'name email')
>>>>>>> 99de3df2183c3bdf5d283e3f000943eea2e2ee8a
            .populate('departmentId', 'name');

        res.status(200).json({
            status: 'success',
            results: doctors.length,
            data: doctors
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

<<<<<<< HEAD
const search = async (req, res) => {
    try {
        const { query } = req.query;
        const hospital = {
            name: "PrimeCare",
            address: "123 Health St, Wellness City",
            phone: "+1234567890",
            email: "info@primecare.com"
        };
        let user = null;
        try {
            const token = req.cookies?.token;
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(decoded.id).select('-Password');
            }
        } catch (error) {
            console.log('Token verification failed in doctorController.search:', error.message);
        }

        const currentPage = 'doctors';
        const pageContent = {
            heroTitle: 'Meet Our Expert Doctors',
            heroSubtitle: 'Our team of highly skilled and compassionate doctors is here to provide you with the best care possible.'
        };
        const footerLinks = [
            { url: '/', text: 'Home' },
            { url: '/User/about', text: 'About Us' },
            { url: '/Department/view', text: 'Departments' },
            { url: '/doctors', text: 'Doctors' },
            { url: '/appointments/quick-appointment', text: 'Book Appointment' },
            { url: "/User/privacy-policy", text: "Privacy Policy" },
            { url: "/User/terms-of-service", text: "Terms of Service" },
            { url: "/User/contact-us", text: "Contact Us" }
        ];
        const socialLinks = [
            { url: '#', icon: 'fab fa-facebook' },
            { url: '#', icon: 'fab fa-twitter' },
            { url: '#', icon: 'fab fa-instagram' },
            { url: '#', icon: 'fab fa-linkedin' }
        ];

        if (!query) {
            // If no query, show all doctors
            const doctors = await Doctor.find()
                .populate('userId', 'FName LName Email PhoneNumber Gender Age')
                .populate('departmentId', 'name');
            return res.render('doctors_page', {
                hospital,
                user,
                currentPage,
                pageContent,
                footerLinks,
                socialLinks,
                doctors,
                searchQuery: '',
                noResults: false
            });
        }

        const searchRegex = new RegExp(query, 'i');
        const doctors = await Doctor.find()
            .populate({
                path: 'userId',
                match: {
                    $or: [
                        { FName: searchRegex },
                        { LName: searchRegex }
                    ]
                }
            })
            .populate('departmentId', 'name');
        const filteredDoctors = doctors.filter(doctor => doctor.userId);

        let finalDoctors = filteredDoctors;
        if (filteredDoctors.length === 0) {
            // Try searching by specialization
            finalDoctors = await Doctor.find({ specialization: searchRegex })
                .populate('userId', 'FName LName Email PhoneNumber Gender Age')
                .populate('departmentId', 'name');
        }

        return res.render('doctors_page', {
            hospital,
            user,
            currentPage,
            pageContent,
            footerLinks,
            socialLinks,
            doctors: finalDoctors,
            searchQuery: query,
            noResults: finalDoctors.length === 0
        });
    } catch (error) {
        console.error('Error searching for doctors:', error);
        return res.status(500).render('doctors_page', {
            hospital: {
                name: "PrimeCare",
                address: "123 Health St, Wellness City",
                phone: "+1234567890",
                email: "info@primecare.com"
            },
            user: null,
            currentPage: 'doctors',
            pageContent: {
                heroTitle: 'Meet Our Expert Doctors',
                heroSubtitle: 'Our team of highly skilled and compassionate doctors is here to provide you with the best care possible.'
            },
            footerLinks: [
                { url: '/', text: 'Home' },
                { url: '/User/about', text: 'About Us' },
                { url: '/Department/view', text: 'Departments' },
                { url: '/doctors', text: 'Doctors' },
                { url: '/appointments/quick-appointment', text: 'Book Appointment' },
                { url: "/User/privacy-policy", text: "Privacy Policy" },
                { url: "/User/terms-of-service", text: "Terms of Service" },
                { url: "/User/contact-us", text: "Contact Us" }
            ],
            socialLinks: [
                { url: '#', icon: 'fab fa-facebook' },
                { url: '#', icon: 'fab fa-twitter' },
                { url: '#', icon: 'fab fa-instagram' },
                { url: '#', icon: 'fab fa-linkedin' }
            ],
            doctors: [],
            searchQuery: req.query.query || '',
            noResults: true,
            error: 'An error occurred while searching for doctors.'
        });
    }
};

=======
>>>>>>> 99de3df2183c3bdf5d283e3f000943eea2e2ee8a
module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteById,
    getByDepartment,
<<<<<<< HEAD
    getBySpecialization,
    search
=======
    getBySpecialization
>>>>>>> 99de3df2183c3bdf5d283e3f000943eea2e2ee8a
};