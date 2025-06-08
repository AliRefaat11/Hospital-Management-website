const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      enum:["AXA Medical","Bupa Health","Cigna Healthcare","MetLife","Allianz Care","None/Self-pay"],
      required: [true, "Company name is required"]
    },
    policyNumber: {
      type: String,
      unique: [true, "Policy number already exists"],
      required: [true, "Policy number is required"]
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"]
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"]
    }
  }
);

const Insurance = mongoose.model("Insurance", insuranceSchema);
module.exports = Insurance;
