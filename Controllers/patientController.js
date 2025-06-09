const Patient = require('../patientRoutes'); // Adjust path as needed, assuming Patient model is exported from patientRoutes for now
const mongoose = require('mongoose');

// Placeholder for Patient Model (if not exported from routes)
// If you define your Mongoose models in a separate 'models' directory, you would import it like:
// const Patient = require('../models/Patient');

// In a real application, you'd likely have a separate 'models' directory.
// For now, let's assume the Patient model is available via the routes file for simplicity
// until we refactor further.

// Define Patient Schema (based on ER diagram) - moved here from patientRoutes.js
const patientSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Assuming User model exists
    bloodType: { type: String, required: true },
    medicalHistory: { type: String },
    medicalNo: { type: String, unique: true, required: true },
    insuranceID: { type: mongoose.Schema.Types.ObjectId, ref: 'Insurance' } // Assuming Insurance model exists
});

const PatientModel = mongoose.model('Patient', patientSchema);

// Get all patients
exports.getAllPatients = async (req, res) => {
    try {
        const patients = await PatientModel.find();
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Get a single patient by ID
exports.getPatientById = async (req, res) => {
    try {
        const patient = await PatientModel.findById(req.params.id);
        if (patient) {
            res.status(200).json(patient);
        } else {
            res.status(404).send('Patient not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Create a new patient
exports.createPatient = async (req, res) => {
    try {
        const newPatient = new PatientModel(req.body);
        await newPatient.save();
        res.status(201).json(newPatient);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Update an existing patient
exports.updatePatient = async (req, res) => {
    try {
        const patient = await PatientModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (patient) {
            res.status(200).json(patient);
        } else {
            res.status(404).send('Patient not found');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Delete a patient
exports.deletePatient = async (req, res) => {
    try {
        const patient = await PatientModel.findByIdAndDelete(req.params.id);
        if (patient) {
            res.status(204).send(); // No content to send back, successful deletion
        } else {
            res.status(404).send('Patient not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
}; 