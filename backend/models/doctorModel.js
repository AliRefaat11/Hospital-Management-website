const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
    {
        
    }
);

class DoctorModel {
    constructor() {
        mongoose.connect();
        this.DocMod = mongoose.model('Doctor', doctorSchema);
    }
    async getAllDoctors() {
        let data = await this.DocMod.find({});
        return JSON.stringify(data);
    }
}

module.exports = DoctorModel;