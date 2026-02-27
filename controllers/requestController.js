const WorkflowTemplate = require("../models/WorkflowTemplate");
const Request = require("../models/Request");
const RequestStage = require("../models/RequestStage");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");


// =============================
// CREATE REQUEST (PATIENT ONLY)
// =============================
exports.createRequest = async (req, res) => {
  try {

    // Role check
    if (req.user.role !== "patient")
      return res.status(403).json("Only patients can create requests");

    // Get patient from JWT
    const patient = await Patient.findById(req.user.id);
    if (!patient)
      return res.status(404).json("Patient not found");

    const patientName = patient.patientName;
    const { workflowType } = req.body;

    // Get workflow template
    const template = await WorkflowTemplate.findOne({ name: workflowType });
    if (!template)
      return res.status(404).json("Workflow not found");

    // Create request
    const request = await Request.create({
      patientName,
      workflowType
    });

    // Create stages
    const stages = template.stages.map(stage => ({
      requestId: request._id,
      department: stage.department,
      order: stage.order
    }));

    await RequestStage.insertMany(stages);

    res.json(request);

  } catch (err) {
    console.error("Create Request Error:", err);
    res.status(500).json(err);
  }
};


// =============================
// APPROVE STAGE (DOCTOR ONLY)
// =============================
exports.approveStage = async (req, res) => {
  try {

    // Role check
    if (req.user.role !== "doctor")
      return res.status(403).json("Only doctors can approve stages");

    const { requestId, department } = req.body;

    // Fetch doctor
    const doctor = await Doctor.findById(req.user.id);
    if (!doctor)
      return res.status(404).json("Doctor not found");

    const actedBy = doctor.doctorName;

    // Fetch request
    const request = await Request.findById(requestId);
    if (!request)
      return res.status(404).json("Request not found");

    // Get current stage
    const currentStage = await RequestStage.findOne({
      requestId,
      order: request.currentStageIndex
    });

    if (!currentStage)
      return res.status(404).json("Stage not found");

    // Validate department sequence
    if (currentStage.department !== department)
      return res.status(403).json("Previous stage not approved yet");

    // Approve stage
    currentStage.approved = true;
    currentStage.actedBy = actedBy;
    currentStage.approvedAt = new Date();
    await currentStage.save();

    // Move to next stage
    request.currentStageIndex += 1;

    const totalStages = await RequestStage.countDocuments({ requestId });

    request.status =
      request.currentStageIndex >= totalStages
        ? "Completed"
        : "In Progress";

    await request.save();

    res.json("Stage Approved");

  } catch (err) {
    console.error("Approve Stage Error:", err);
    res.status(500).json(err);
  }
};


// =============================
// GET REQUEST STATUS
// =============================
exports.getRequestStatus = async (req, res) => {
  try {

    const { id } = req.params;

    const request = await Request.findById(id);
    if (!request)
      return res.status(404).json("Request not found");

    const stages = await RequestStage.find({ requestId: id }).sort("order");

    res.json({
      request,
      stages
    });

  } catch (err) {
    console.error("Get Status Error:", err);
    res.status(500).json(err);
  }
};