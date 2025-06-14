const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
    {
        userId:{
            type:mongoose.Schema.ObjectId,
            ref:"User",
            unique:[true,"user id already exists"],
            required:[true,"user id is required"],
        },
        departmentId:{
            type:mongoose.Schema.ObjectId,
            ref:"Department",
            required:[true,"Department id is required"]
        },
        specialization: {
            type: String,  
            trim:true,
            required:[true,"speciality is required"],
            enum:["cardiology","dermatology","orthopedics","pediatrics","Neurology"]
        },
        rating: {
            type: Number,
            min:1,
            max:5,
            required: true
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'on-leave'],
            default: 'active'
        },
        schedule: [
            {
                day: { type: String, enum: ["saturday","sunday","monday","tuesday","wednesday","thursday"], required: true },
                startTime: { type: String, required: true }, // e.g., "09:00"
                endTime: { type: String, required: true }    // e.g., "17:00"
            }
        ],
        departmentName: {
            type: String,
            trim: true
        }
    }
);

const Doctor = mongoose.model("Doctor",doctorSchema);
module.exports = Doctor;