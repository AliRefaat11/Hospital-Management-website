const Doctor = require("../Models/doctorModel");
const User = require("../Models/userModel");
const Department = require("../Models/departmentModel");
const bcrypt = require('bcryptjs');
const { createToken } = require("../middleware/authMiddleware");
const jwt = require('jsonwebtoken');

const getAll = async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .populate('userId', 'FName LName Email PhoneNumber Gender Age')
            .populate('departmentId', 'departmentName');
        
        res.status(200).json({
            status: 'success',
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
            return res.status(404).render('errorPage', { message: 'Doctor not found' });
        }

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

        res.render('doctorProfile', {
            doctor,
            user,
            hospital,
            currentPage: 'doctors'
        });
    } catch (error) {
        console.error("Error rendering doctor profile page:", error);
        res.status(500).render('errorPage', { message: "Error loading doctor profile." });
    }
};

const create = async (req, res) => {
    try {
        // First create the user
        const userData = {
            FName: req.body.FName,
            LName: req.body.LName,
            Email: req.body.Email,
            PhoneNumber: req.body.PhoneNumber,
            Gender: req.body.Gender,
            Age: req.body.Age,
            Password: 'defaultPassword123', // You should generate a secure password
            Role: 'doctor'
        };

        const user = await User.create(userData);

        // Then create the doctor
        const doctorData = {
            userId: user._id,
            departmentId: req.body.departmentId,
            specialization: req.body.specialization,
            rating: req.body.rating || 5,
            status: 'active',
            schedule: req.body.schedule || []
        };

        const doctor = await Doctor.create(doctorData);

        res.status(201).json({
            status: 'success',
            data: {
                doctor,
                user
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
        const doctor = await Doctor.findById(req.params.id);
        
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Doctor not found'
            });
        }

        // Update user information
        if (req.body.FName || req.body.LName || req.body.Email || req.body.PhoneNumber) {
            await User.findByIdAndUpdate(doctor.userId, {
                FName: req.body.FName,
                LName: req.body.LName,
                Email: req.body.Email,
                PhoneNumber: req.body.PhoneNumber
            });
        }

        // Update doctor information
        const updatedDoctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            {
                departmentId: req.body.departmentId,
                specialization: req.body.specialization,
                rating: req.body.rating,
                status: req.body.status,
                schedule: req.body.schedule
            },
            { new: true }
        ).populate('userId', 'FName LName Email PhoneNumber Gender Age')
         .populate('departmentId', 'departmentName');

        res.status(200).json({
            status: 'success',
            data: updatedDoctor
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
        const doctor = await Doctor.findById(req.params.id);
        
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Doctor not found'
            });
        }

        // Delete the associated user
        await User.findByIdAndDelete(doctor.userId);
        
        // Delete the doctor
        await Doctor.findByIdAndDelete(req.params.id);

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
            .populate('userId', 'FName LName Email PhoneNumber Gender Age')
            .populate('departmentId', 'departmentName');

        res.status(200).json({
            status: 'success',
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
            .populate('userId', 'FName LName Email PhoneNumber Gender Age')
            .populate('departmentId', 'departmentName');

        res.status(200).json({
            status: 'success',
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
        const searchQuery = req.query.query;
        
        if (!searchQuery) {
            // If no search query, return all doctors
            const doctors = await Doctor.find()
                .populate('userId', 'FName LName Email PhoneNumber Gender Age')
                .populate('departmentId', 'departmentName');
            
            return res.status(200).json({
                status: 'success',
                data: doctors
            });
        }
        
        const doctors = await Doctor.find()
            .populate({
                path: 'userId',
                match: {
                    $or: [
                        { FName: { $regex: searchQuery, $options: 'i' } },
                        { LName: { $regex: searchQuery, $options: 'i' } },
                        { Email: { $regex: searchQuery, $options: 'i' } }
                    ]
                }
            })
            .populate('departmentId', 'departmentName');

        // Filter out doctors where userId is null (no match)
        const filteredDoctors = doctors.filter(doctor => doctor.userId);

        res.status(200).json({
            status: 'success',
            data: filteredDoctors
        });
    } catch (error) {
        console.error("Error searching doctors:", error);
        res.status(500).json({
            status: 'error',
            message: "Error searching for doctors."
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