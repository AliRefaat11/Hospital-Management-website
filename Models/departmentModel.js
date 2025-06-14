const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  departmentName: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  numberOfDoctors: {
    type: Number,
    default: 0
  }
});

// Check if the model already exists to prevent redeclaration errors
module.exports = mongoose.models.Department || mongoose.model('Department', departmentSchema);