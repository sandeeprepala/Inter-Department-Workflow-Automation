const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  name: String,
  role: {
    type: String,
    enum: ["Billing", "Lab", "Pharmacy", "Insurance", "Admin"],
    required: true
  },
  password: String
}, { timestamps: true });

module.exports = mongoose.model("Staff", staffSchema);
