const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.ObjectId,
      ref: "Patient",
      required: [true, "Patient ID is required"]
    },
    diagnosis: {
      type: String,
      required: [true, "Diagnosis is required"]
    },
    treatment: {
      type: String,
      required: [true, "Treatment is required"]
    },
    date: {
      type: Date,
      required: [true, "Date of record is required"]
    },
    notes: {
      type: String
    }
  }
);

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);
module.exports = MedicalRecord;