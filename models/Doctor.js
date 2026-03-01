const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  doctorName: String,
  qualification:String,
  patientNames:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient"
  }],
  password:String
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);