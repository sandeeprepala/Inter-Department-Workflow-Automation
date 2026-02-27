const WorkflowTemplate = require("../models/WorkflowTemplate");

exports.createWorkflow = async (req, res) => {
  try {
    const workflow = await WorkflowTemplate.create(req.body);
    res.json(workflow);
  } catch (err) {
    res.status(500).json(err);
  }
};