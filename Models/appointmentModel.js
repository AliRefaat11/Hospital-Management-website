const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctorID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required'],
    index: true
  },
  patientID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient', 
    required: [true, 'Patient ID is required'],
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Appointment date must be in the future'
    }
  },
  startingHour: {
    type: String,
    required: [true, 'Starting hour is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rescheduled', 'no-show'],
      message: 'Invalid appointment status'
    },
    default: 'scheduled'
  },
  reason: {
    type: String,
    required: [true, 'Reason for appointment is required'],
    trim: true,
    minlength: [5, 'Reason must be at least 5 characters'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
});

appointmentSchema.index({ doctorID: 1, date: 1, startingHour: 1 }, { unique: true });

const Appointment = mongoose.model("Appointment",appointmentSchema);
module.exports = Appointment;