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
        DateOfBirth: {
            type: Date,
            required: [true, "Date of Birth is required"],
        },
        Address: {
            type: String,
            trim: true,
            required: [true, "Address is required"],
        },
        emailNotifications: {
            type: Boolean,
            default: true
        },
        smsNotifications: {
            type: Boolean,
            default: false
        },
        privateProfile: {
            type: Boolean,
            default: false
        }
    }
);

const User = mongoose.model("User",userSchema);
module.exports = User;