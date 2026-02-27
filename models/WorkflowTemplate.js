const mongoose = require("mongoose");

const stageSchema = new mongoose.Schema({
  department: String,
  order: Number
});

const workflowTemplateSchema = new mongoose.Schema({
  name: String,
  stages: [stageSchema]
});

module.exports = mongoose.model("WorkflowTemplate", workflowTemplateSchema);