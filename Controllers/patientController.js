const Patient = require('../Models/patientModel');
const User = require('../Models/userModel')

exports.getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find()
            .populate('userId', 'FName LName Email PhoneNumber')
            .populate('insuranceId', 'company policyNumber');
            
        res.status(200).json({
            status: 'success',
            results: patients.length,
            data: patients
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve patients',
            error: error.message
        });
    }
};

exports.getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id)
            .populate('userId', 'FName LName Email PhoneNumber Gender Age')
            .populate('insuranceId', 'company policyNumber startDate endDate');

        if (!patient) {
            return res.status(404).json({
                status: 'fail',
                message: 'Patient not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: patient
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve patient',
            error: error.message
        });
    }
};

exports.signup = async (req,res) => {
    const {FName,LName,Email,Password,Age,PhoneNumber,Gender,bloodType,medicalNo}= req.body;
    try{
        const newUser = new User({FName,LName,Email,Password,Age,PhoneNumber,Gender,role:"Patient"});
        const savedUser = await newUser.save();

        const newPatient = new Patient({userId:savedUser._id,
            bloodType,medicalNo
        })
        const savedPatient = await newPatient.save();

        return res.status(200).json({
            user:newUser,
            patient:newPatient
        })
    }
    catch(error){
        return res.status(500).json({
            message:error.message,
        })
    }
}

exports.createPatient = async (req, res) => {
    try {

        // Check if patient with same medical number already exists
        const existingPatient = await Patient.findOne({ medicalNo: req.body.medicalNo });
        if (existingPatient) {
            return res.status(400).json({
                status: 'fail',
                message: 'Patient with this medical number already exists'
            });
        }

        const newPatient = await Patient.create(req.body);
        
        // Populate the created patient's data
        await newPatient.populate('userId', 'FName LName Email PhoneNumber');
        await newPatient.populate('insuranceId', 'company policyNumber');

        res.status(201).json({
            status: 'success',
            data: newPatient
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: 'Failed to create patient',
            error: error.message
        });
    }
};

// Update an existing patient
exports.updatePatient = async (req, res) => {
    try {
        // Don't allow updating medical number if it's being changed
        if (req.body.medicalNo) {
            const existingPatient = await Patient.findOne({ 
                medicalNo: req.body.medicalNo,
                _id: { $ne: req.params.id }
            });
            
            if (existingPatient) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Medical number already exists for another patient'
                });
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
            return res.status(404).json({
                status: 'fail',
                message: 'Patient not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: patient
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: 'Failed to update patient',
            error: error.message
        });
    }
};

// Delete a patient
exports.deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);
        
        if (!patient) {
            return res.status(404).json({
                status: 'fail',
                message: 'Patient not found'
            });
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete patient',
            error: error.message
        });
    }
}; 