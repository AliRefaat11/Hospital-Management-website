const mongoose = require("mongoose");

const treatmentPlanSchema = new mongoose.Schema(
    {
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: [true, "Appointment ID is required"]
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: [true, "Patient ID is required"]
        },
        startDate: {
            type: Date,
            required: [true, "Start date is required"]
        },
        endDate: {
            type: Date,
            required: [true, "End date is required"]
        },
        description: {
            type: String,
            required: [true, "Description is required"]
        }
    },
    {
        timestamps: true 
    }
);

module.exports = mongoose.model("TreatmentPlan", treatmentPlanSchema);
