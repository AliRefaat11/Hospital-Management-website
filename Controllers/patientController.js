const Patient = require('../Models/patientModel');
const User = require('../Models/userModel');
const { auth, allowedTo, ApiError } = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

// Public routes (no auth needed)
exports.signup = asyncHandler(async (req, res, next) => {
    const {FName,LName,Email,Password,Age,PhoneNumber,Gender,bloodType,medicalNo}= req.body;
    try {
        const hashedPassword = await bcrypt.hash(Password, 10);
        const newUser = new User({
            FName,
            LName,
            Email,
            Password: hashedPassword,
            Age,
            PhoneNumber,
            Gender,
            role: "Patient"
        });
        const savedUser = await newUser.save();
        const newPatient = new Patient({
            userId: savedUser._id,
            bloodType,
            medicalNo
        });
        const savedPatient = await newPatient.save();
        return res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: savedUser._id,
                    email: savedUser.Email,
                    name: `${savedUser.FName} ${savedUser.LName}`
                },
                patient: {
                    id: savedPatient._id,
                    medicalNo: savedPatient.medicalNo,
                    bloodType: savedPatient.bloodType
                }
            }
        });
    } catch(error) {
        return next(new ApiError(error.message, 400));
    }
});

exports.getLoggedPatientData = asyncHandler(async (req, res, next) => {
    
});

exports.getAllPatients = asyncHandler(async (req, res, next) => {
    const patients = await Patient.find()
        .populate('userId', 'FName LName Email PhoneNumber')
        .populate('insuranceId', 'company policyNumber');
        
    res.status(200).json({
        status: 'success',
        results: patients.length,
        data: patients
    });
});

exports.getPatientById = asyncHandler(async (req, res, next) => {
    const patient = await Patient.findById(req.params.id)
        .populate('userId', 'FName LName Email PhoneNumber Gender Age')
        .populate('insuranceId', 'company policyNumber startDate endDate');

    if (!patient) {
        return next(new ApiError('Patient not found', 404));
    }

    // Only allow access if user is admin or the patient themselves
    if (req.user.role !== 'Admin' && patient.userId._id.toString() !== req.user._id.toString()) {
        return next(new ApiError('You are not authorized to access this patient\'s data', 403));
    }

    res.status(200).json({
        status: 'success',
        data: patient
    });
});

// Admin only routes
exports.createPatient = asyncHandler(async (req, res, next) => {
    const existingPatient = await Patient.findOne({ medicalNo: req.body.medicalNo });
    if (existingPatient) {
        return next(new ApiError('Patient with this medical number already exists', 400));
    }

    const newPatient = await Patient.create(req.body);
    await newPatient.populate('userId', 'FName LName Email PhoneNumber');
    await newPatient.populate('insuranceId', 'company policyNumber');

    res.status(201).json({
        status: 'success',
        data: newPatient
    });
});

exports.updatePatient = asyncHandler(async (req, res, next) => {
    if (req.body.medicalNo) {
        const existingPatient = await Patient.findOne({ 
            medicalNo: req.body.medicalNo,
            _id: { $ne: req.params.id }
        });
        
        if (existingPatient) {
            return next(new ApiError('Medical number already exists for another patient', 400));
        }
    }

    const patient = await Patient.findByIdAndUpdate(
        req.params.id,
        req.body,
        { 
            new: true, 
            runValidators: true 
        }
    ).populate('userId', 'FName LName Email PhoneNumber')
     .populate('insuranceId', 'company policyNumber');

    if (!patient) {
        return next(new ApiError('Patient not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: patient
    });
});

exports.deletePatient = asyncHandler(async (req, res, next) => {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
        return next(new ApiError('Patient not found', 404));
    }

    const userId = patient.userId;
    await Patient.findByIdAndDelete(req.params.id);
    await User.findByIdAndDelete(userId);

    res.status(204).json({
        status: 'success',
        data: null
    });
}); 