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
        departmentName: {
            type: String,
            trim: true
        },
        availableDays: [
            {
                type: String,
                enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            }
        ],
        weeklySchedule: [
            {
                dayOfWeek: {
                    type: String,
                    enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                    required: true
                },
                timeSlots: [
                    {
                        type: String, // e.g., "09:00", "14:30"
                        match: /^[0-9]{2}:[0-9]{2}$/ // HH:MM format
                    }
                ]
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Doctor', doctorSchema);