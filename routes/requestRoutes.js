const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  createRequest,
  approveStage,
  getRequestStatus
} = require("../controllers/requestController");

// Protected routes
router.post("/create", auth, createRequest);
router.post("/approve", auth, approveStage);

// Public route (optional)
router.get("/:id",auth, getRequestStatus);

module.exports = router;