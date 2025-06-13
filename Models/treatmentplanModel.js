const mongoose = require("mongoose");

<<<<<<< HEAD
const treatmentPlanSchema = new mongoose.Schema(
    {
        appointmentId: {
            type: mongoose.Schema.ObjectId,
            ref: "Appointment",
            required: [true, "Appointment ID is required"]
        },
        patientId: {
            type: mongoose.Schema.ObjectId,
            ref: "Patient",
            //required: [true, "Patient ID is required"]
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

const TreatmentPlan = mongoose.model("TreatmentPlan", treatmentPlanSchema);
module.exports = TreatmentPlan;
=======
const treatmentPlanSchema = new mongoose.Schema({
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String, required: true }
});
>>>>>>> 99de3df2183c3bdf5d283e3f000943eea2e2ee8a

module.exports = mongoose.model("TreatmentPlan", treatmentPlanSchema);
