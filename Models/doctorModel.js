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
            //required:[true,"Department id is required"]
        },
        specialization: {
            type: String,
            trim:true,
            required:[true,"speciality is required"],
            enum:[">cardiology","dermatology","orthopedics","pediatrics","Neurology"]
        },
        rating: {
            type: Number,
            min:1,
            max:5,
            required: true
        },
        schedule: {
            type: String,
            required:[true,"working days is required"],
            enum:["saturday","sunday","monday","tuesday","wednesday","thursday"]
        }
    }
);

const Doctor = mongoose.model("Doctor",doctorSchema);
module.exports = Doctor;