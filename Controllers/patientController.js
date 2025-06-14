const Patient = require('../Models/patientModel');
const User = require('../Models/userModel');
const { auth, allowedTo, ApiError } = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const Doctor = require('../Models/doctorModel');

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
        return res.redirect('/login');
    } catch(error) {
        return next(new ApiError(error.message, 400));
    }
});

exports.getLoggedPatientData = asyncHandler(async (req, res, next) => {

  const user = req.user;
  const patient = await Patient.findOne({ userId: req.user._id });
  if (!user) {
    return next(new ApiError("user not found", 404));
  }
  if (!patient) {
    return next(new ApiError("Patient not found", 404));
  }
  const patientPlain = patient.toObject();
  const userPlain = user.toObject();

  // Find all doctors (no currentPatients field, so return all doctors for demo)
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

  res.status(200).json({
    status: "success",
    data: {
      Profile: {
        ...userPlain,
        ...patientPlain,
        doctors: doctorList
      },
    },
  });
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