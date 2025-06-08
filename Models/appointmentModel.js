const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
    {
        
    }
);

const Appointment = mongoose.model("Appointment",appointmentSchema);
module.exports = Appointment;