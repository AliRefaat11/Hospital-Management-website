const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
    {
        
    }
);

class PatientModel {
    constructor() {
        mongoose.connect();
        this.PatMod=mongoose.model('Patient', patientSchema);
    }
    async getAllPatients() {
        let data = await this.PatMod.find({});
        return JSON.stringify(data);
    }
}

module.exports = PatientModel;