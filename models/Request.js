const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  patientName: String,
  workflowType: String,

  currentStageIndex: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    default: "Pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);