const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  doctorName: String,
  qualification:String,
  patientNames:[String],
  password:String
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);