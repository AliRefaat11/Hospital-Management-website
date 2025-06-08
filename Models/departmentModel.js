const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  // Basic Fields
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
  },
});

const Department = mongoose.model('Department', departmentSchema);
module.exports=Department;