const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.ObjectId,
            ref: "Patient",
            required: [true, "Patient ID is required"]
        },
        documentUrl: {
            type: String,
            required: [true, "Document URL is required"]
        },
        notes: {
            type: String,
            default: "" 
        }
    },
    {
        timestamps: true 
    }
);

const Document = mongoose.model("Document", documentSchema);
module.exports = Document;
