const Patient = require('../models/Patient');
exports.createPatient = async (req, res) => {
  try {
    const { patientId, name, email, phone, gender, dob, medicalCondition, lastVisit, status } = req.body;

    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: 'Patient with this email already exists' });
    }

    const newPatient = new Patient({
      patientId,
      name,
      email,
      phone,
      gender,
      dob,
      medicalCondition,
      lastVisit,
      status,
    });

    await newPatient.save();
    res.status(201).json({ message: 'Patient created successfully', patient: newPatient });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.status(200).json({ patients });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({ patient });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedPatient = await Patient.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({ message: 'Patient updated successfully', patient: updatedPatient });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPatient = await Patient.findByIdAndDelete(id);

    if (!deletedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
