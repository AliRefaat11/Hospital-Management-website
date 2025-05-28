const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
    {
        
    }
);

class AppointmentModel {
    constructor() {
        mongoose.connect();
        this.AppointmentMod=mongoose.model('Appointment', appointmentSchema);
    }
    async getAllAppointments() {
        let data = await this.AppointmentMod.find({});
        return JSON.stringify(data);
    }
}

module.exports = AppointmentModel;