const WorkflowTemplate = require("../models/WorkflowTemplate");
const Request = require("../models/Request");
const RequestStage = require("../models/RequestStage");

// CREATE REQUEST
exports.createRequest = async (req, res) => {
  try {
    const { patientName, workflowType } = req.body;

    const template = await WorkflowTemplate.findOne({ name: workflowType });
    if (!template) return res.status(404).json("Workflow not found");

    const request = await Request.create({
      patientName,
      workflowType
    });

    const stages = template.stages.map(stage => ({
      requestId: request._id,
      department: stage.department,
      order: stage.order
    }));

    await RequestStage.insertMany(stages);

    res.json(request);

  } catch (err) {
    res.status(500).json(err);
  }
};


// APPROVE STAGE
exports.approveStage = async (req, res) => {
  try {
    const { requestId, department, actedBy } = req.body;

    const request = await Request.findById(requestId);

    const currentStage = await RequestStage.findOne({
      requestId,
      order: request.currentStageIndex
    });

    if (currentStage.department !== department)
      return res.status(403).json("Previous stage not approved yet");

    currentStage.approved = true;
    currentStage.actedBy = actedBy;
    currentStage.approvedAt = new Date();
    await currentStage.save();

    request.currentStageIndex += 1;

    const totalStages = await RequestStage.countDocuments({ requestId });

    if (request.currentStageIndex >= totalStages)
      request.status = "Completed";
    else
      request.status = "In Progress";

    await request.save();

    res.json("Stage Approved");

  } catch (err) {
    res.status(500).json(err);
  }
};


// GET TRACKING
exports.getRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await Request.findById(id);
    const stages = await RequestStage.find({ requestId: id }).sort("order");

    res.json({ request, stages });

  } catch (err) {
    res.status(500).json(err);
  }
};