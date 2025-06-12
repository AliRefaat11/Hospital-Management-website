const mongoose = require("mongoose");

const treatmentPlanSchema = new mongoose.Schema({
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String, required: true }
});

module.exports = mongoose.model("TreatmentPlan", treatmentPlanSchema);
