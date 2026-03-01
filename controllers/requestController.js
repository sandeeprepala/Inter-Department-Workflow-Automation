const WorkflowTemplate = require("../models/WorkflowTemplate");
const Request = require("../models/Request");
const RequestStage = require("../models/RequestStage");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Staff = require("../models/Staff");


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
// APPROVE STAGE (ALL AUTHORIZED STAFF)
// =============================
exports.approveStage = async (req, res) => {
  try {

    const { requestId, department } = req.body;
    const { role, id } = req.user;

    // Allowed roles (normalized to lowercase for easier check)
    const allowedRoles = ["doctor", "billing", "lab", "pharmacy", "insurance", "admin"];
    const normalizedRole = role.toLowerCase();
    if (!allowedRoles.includes(normalizedRole))
      return res.status(403).json("Only authorized personnel can approve stages");

    // Fetch user based on role
    let person;
    let actedBy;

    if (normalizedRole === "doctor") {
      person = await Doctor.findById(id);
      if (!person)
        return res.status(404).json("Doctor not found");
      actedBy = person.doctorName;
    } else {
      person = await Staff.findById(id);
      if (!person)
        return res.status(404).json("Staff member not found");
      actedBy = person.name;
    }

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

    // Validate department sequence (normalized case check)
    if (currentStage.department.toLowerCase() !== department.toLowerCase())
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


// =============================
// GET ALL REQUESTS FOR A USER
// =============================
// Finds requests for a patient (by patientName) or requests a staff/doctor has acted on OR needs to act on
exports.getRequestsForUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Try patient
    let user = await Patient.findById(id);
    if (user) {
      const name = user.patientName || user.name;
      const requests = await Request.find({ patientName: name }).sort({ createdAt: -1 });

      // For each request, get its stages
      const requestsWithStages = await Promise.all(requests.map(async (req) => {
        const stages = await RequestStage.find({ requestId: req._id }).sort("order");
        return { ...req._doc, stages };
      }));

      return res.json({
        user: {
          id: user._id,
          role: 'patient',
          name,
          treatmentvisits: user.treatmentvisits || 0,
          MedicineCost: user.MedicineCost || 0,
          LabCharges: user.LabCharges || 0,
          insuranceClaim: user.insuranceClaim || 0
        },
        requests: requestsWithStages
      });
    }

    // Try doctor
    user = await Doctor.findById(id);
    if (user) {
      const name = user.doctorName || user.name;

      // 1. Get requests they've already acted on
      const approvedStages = await RequestStage.find({ actedBy: name }).sort({ approvedAt: -1 });
      const actedRequestIds = [...new Set(approvedStages.map(s => s.requestId.toString()))];

      // 2. Get pending requests for "Doctor" department
      // A request is pending for "Doctor" if its current stage department is "Doctor"
      // This is a bit tricky with the current schema. We need to find stages with department "Doctor" 
      // where the request's currentStageIndex matches the stage's order.

      // Let's find all stages for department "Doctor" that are not yet approved
      const pendingStages = await RequestStage.find({ department: "Doctor", approved: false });
      const pendingRequestIds = [];

      for (const stage of pendingStages) {
        const reqObj = await Request.findById(stage.requestId);
        if (reqObj && reqObj.currentStageIndex === stage.order) {
          pendingRequestIds.push(stage.requestId.toString());
        }
      }

      const allRequestIds = [...new Set([...actedRequestIds, ...pendingRequestIds])];
      const requests = await Request.find({ _id: { $in: allRequestIds } }).sort({ updatedAt: -1 });

      const requestsWithStages = await Promise.all(requests.map(async (req) => {
        const stages = await RequestStage.find({ requestId: req._id }).sort("order");
        return { ...req._doc, stages };
      }));

      return res.json({
        user: { id: user._id, role: 'doctor', name },
        requests: requestsWithStages,
        pendingRequestIds
      });
    }

    // Try staff
    user = await Staff.findById(id);
    if (user) {
      const name = user.name;
      const dept = user.role; // e.g., "Billing", "Lab", etc.

      // 1. Get requests they've already acted on
      const approvedStages = await RequestStage.find({ actedBy: name }).sort({ approvedAt: -1 });
      const actedRequestIds = [...new Set(approvedStages.map(s => s.requestId.toString()))];

      // 2. Get pending requests for their department
      const pendingStages = await RequestStage.find({ department: dept, approved: false });
      const pendingRequestIds = [];

      for (const stage of pendingStages) {
        const reqObj = await Request.findById(stage.requestId);
        if (reqObj && reqObj.currentStageIndex === stage.order) {
          pendingRequestIds.push(stage.requestId.toString());
        }
      }

      const allRequestIds = [...new Set([...actedRequestIds, ...pendingRequestIds])];
      const requests = await Request.find({ _id: { $in: allRequestIds } }).sort({ updatedAt: -1 });

      const requestsWithStages = await Promise.all(requests.map(async (req) => {
        const stages = await RequestStage.find({ requestId: req._id }).sort("order");
        return { ...req._doc, stages };
      }));

      return res.json({
        user: { id: user._id, role: dept.toLowerCase(), name },
        requests: requestsWithStages,
        pendingRequestIds
      });
    }

    return res.status(404).json("User not found");

  } catch (err) {
    console.error("Get Requests For User Error:", err);
    res.status(500).json(err);
  }
};