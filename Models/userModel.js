const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        FName: {
            type: String,
            trim:true,
            required: [true,"name is required"],
            minlength:[2,"this name is too small"],
            maxlength:[15,"this name is larger than the max"]
        },
        LName: {
            type: String,
            trim:true,
            required: [true,"name is required"],
            minlength:[2,"this name is too small"],
            maxlength:[15,"this name is larger than the max"]
        },
        Email: {
            type: String,
            trim:true,
            lowercase:true,
            unique:[true,"Email already exists"],
            required:[true,"Email is required"]
        },
        role:{
            type:String,
            enum:["Patient","Doctor","Admin"],
            default:"Patient"
        },
        Password:{
            type: String,
            trim:true,
            required:[true,"password is required"]
        },
        PhoneNumber: {
            type: String,
            trim:true,
            unique:[true,"phone number exist"],
            required: [true, "Phone number is required"]
        },
        Gender: {
            type: String,
            trim:true,
            required: [true, "gender number is required"],
            enum: ["Male","Female"]
        },
        Age: {
            type: Number,
            trim:true,
            required:[true,"Age is required"],
        },
        dateOfBirth: {
            type: Date,
        },
        address: {
            type: String,
            trim: true,
        },
        primaryDoctor: {
            type: String, // Or ObjectId if linking to Doctor model
            trim: true,
        },
        insuranceProvider: {
            type: String,
            trim: true,
        },
        insuranceID: {
            type: String,
            trim: true,
        }
    }
);

const User = mongoose.model("User",userSchema);
module.exports = User;