const Patient = require('../models/patientModel');

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