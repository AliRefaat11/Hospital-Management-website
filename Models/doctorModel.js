const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        id: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password:{
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        specialization: {
            type: String,
            required: true
        },
        rating: {
            type: Int,
            required: true
        },
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