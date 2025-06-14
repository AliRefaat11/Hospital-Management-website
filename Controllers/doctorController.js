const Doctor = require("../Models/doctorModel");
const User = require("../Models/userModel");
const bcrypt = require('bcryptjs');
const { createToken } = require("../middleware/authMiddleware");
const jwt = require('jsonwebtoken');
const Appointment = require("../Models/appointmentModel");
const Department = require('../Models/departmentModel');

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
            .populate('departmentId', 'departmentName');
        
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Doctor not found'
            });
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
        const { FName, LName, Email, Password, PhoneNumber, Gender, Age, departmentId, specialization, rating, experience, profileImage, weeklySchedule } = req.body;

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
            departmentName: department.name,
            experience,
            profileImage,
            weeklySchedule: weeklySchedule || [] // Save weeklySchedule
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
            { ...req.body, weeklySchedule: req.body.weeklySchedule || [] }, // Update weeklySchedule
            {
                new: true,
                runValidators: true
            }
        );
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Doctor not found'
            });
        }

        // Update associated user data if provided (e.g., FName, LName, Email, PhoneNumber)
        if (req.body.FName || req.body.LName || req.body.Email || req.body.PhoneNumber || req.body.Gender || req.body.Age) {
            const userUpdateData = {};
            if (req.body.FName) userUpdateData.FName = req.body.FName;
            if (req.body.LName) userUpdateData.LName = req.body.LName;
            if (req.body.Email) userUpdateData.Email = req.body.Email;
            if (req.body.PhoneNumber) userUpdateData.PhoneNumber = req.body.PhoneNumber;
            if (req.body.Gender) userUpdateData.Gender = req.body.Gender;
            if (req.body.Age) userUpdateData.Age = req.body.Age;

            await User.findByIdAndUpdate(doctor.userId, userUpdateData, { new: true, runValidators: true });
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
        const searchQuery = req.query.q;
        
        if (!searchQuery) {
            const doctors = await Doctor.find()
                .populate('userId', 'FName LName Email PhoneNumber Gender Age')
                .populate('departmentId', 'departmentName');
            return res.status(200).json({
                status: 'success',
                data: doctors
            });
        }

        const doctors = await Doctor.find({
            $or: [
                { specialization: { $regex: searchQuery, $options: 'i' } },
                { 'userId.FName': { $regex: searchQuery, $options: 'i' } },
                { 'userId.LName': { $regex: searchQuery, $options: 'i' } }
            ]
        })
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