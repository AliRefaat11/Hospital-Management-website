const Doctor = require("../Models/doctorModel");
const User = require("../Models/userModel");
const Department = require("../Models/departmentModel");
const bcrypt = require('bcryptjs');
const { createToken } = require("../middleware/authMiddleware");
const jwt = require('jsonwebtoken');
const Appointment = require("../Models/appointmentModel");

const getAll = async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .populate('userId', 'FName LName Email PhoneNumber Gender Age')
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

const getById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
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
    }
};

const create = async (req, res) => {
    try {
        const { FName, LName, Email, Password, PhoneNumber, Gender, Age, departmentId, specialization, rating } = req.body;

        // Create user
        const hashedPassword = await bcrypt.hash(Password, 12);
        const newUser = await User.create({
            FName,
            LName,
            Email,
            Password: hashedPassword,
            PhoneNumber,
            Gender,
            Age,
            role: 'Doctor'
        });

        // Get department name
        const department = await Department.findById(departmentId);
        if (!department) {
            await User.findByIdAndDelete(newUser._id);
            return res.status(400).json({
                status: 'fail',
                message: 'Department not found'
            });
        }

        // Create doctor
        const newDoctor = await Doctor.create({
            userId: newUser._id,
            departmentId,
            specialization,
            rating,
            departmentName: department.name
        });

        res.status(201).json({
            status: 'success',
            data: {
                doctor: newDoctor,
                user: newUser
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
            .populate('userId', 'FName LName email')
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

const search = async (req, res) => {
    try {
        const { query } = req.query;
        const hospital = req.hospital || { name: 'PrimeCare', address: '', phone: '', email: '' };
        const user = req.user || null;
        const currentPage = 'doctors';
        const pageContent = {
            heroTitle: 'Meet Our Expert Doctors',
            heroSubtitle: 'Our team of highly skilled and compassionate doctors is here to provide you with the best care possible.'
        };
        const footerLinks = [
            { url: '/', text: 'Home' },
            { url: '/about', text: 'About Us' },
            { url: '/department/view/all', text: 'Departments' },
            { url: '/doctors', text: 'Doctors' },
            { url: '/appointments', text: 'Book Now' }
        ];
        const socialLinks = [
            { url: '#', icon: '<i class="fab fa-facebook"></i>' },
            { url: '#', icon: '<i class="fab fa-twitter"></i>' },
            { url: '#', icon: '<i class="fab fa-instagram"></i>' }
        ];

        if (!query) {
            // If no query, show all doctors
            const doctors = await Doctor.find()
                .populate('userId', 'FName LName Email PhoneNumber Gender Age')
                .populate('departmentId', 'name');
            return res.render('doctorPage', {
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

        return res.render('doctorPage', {
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
        return res.status(500).render('doctorPage', {
            hospital: req.hospital || { name: 'PrimeCare', address: '', phone: '', email: '' },
            user: req.user || null,
            currentPage: 'doctors',
            pageContent: {
                heroTitle: 'Meet Our Expert Doctors',
                heroSubtitle: 'Our team of highly skilled and compassionate doctors is here to provide you with the best care possible.'
            },
            footerLinks: [],
            socialLinks: [],
            doctors: [],
            searchQuery: req.query.query || '',
            noResults: true,
            error: 'An error occurred while searching for doctors.'
        });
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteById,
    getByDepartment,
    getBySpecialization,
    search
};