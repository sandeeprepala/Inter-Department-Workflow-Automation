const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  createRequest,
  approveStage,
  getRequestStatus
} = require("../controllers/requestController");
const { getRequestsForUser } = require("../controllers/requestController");

// Protected routes
router.post("/create", auth, createRequest);
router.post("/approve", auth, approveStage);

// Public route (optional)
router.get("/:id",auth, getRequestStatus);
// Get requests for a specific user (patient, doctor or staff)
router.get("/user/:id", auth, getRequestsForUser);

module.exports = router;