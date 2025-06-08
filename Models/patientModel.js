const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
    {
        
    }
);

const Patient = mongoose.model("Patient",patientSchema);
module.exports = Patient;