const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      unique: [true, "User ID already exists for a patient"],
      required: [true, "User ID is required"]
    },
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: [true, "Blood type is required"]
    },
    medicalHistory: {
      type: String
    },
    medicalNo: {
      type: String,
      unique: [true, "Medical number already exists"],
      required: [true, "Medical number is required"]
    },
    insuranceId: {
      type: mongoose.Schema.ObjectId,
      ref: "Insurance"
    }
  }
);

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;
