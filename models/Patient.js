const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  patientName: String,
  disease: String,
  doctorName: String,
  treatmentvisits: Number,
  treatmentStatus: [String],
  MedicineCost:Number,
  LabCharges:Number,
  insuranceClaim:Number,
  password: String
}, { timestamps: true });

module.exports = mongoose.model("Patient", patientSchema);