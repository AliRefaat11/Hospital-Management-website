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
            .populate('departmentId', 'departmentName');
        
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Doctor not found'
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
        const searchQuery = req.query.q;
        
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