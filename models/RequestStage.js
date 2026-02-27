const mongoose = require("mongoose");

const requestStageSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Request"
  },

  department: String,
  order: Number,

  approved: {
    type: Boolean,
    default: false
  },

  actedBy: String,
  approvedAt: Date
});

module.exports = mongoose.model("RequestStage", requestStageSchema);