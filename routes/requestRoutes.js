const router = require("express").Router();
const {
  createRequest,
  approveStage,
  getRequestStatus
} = require("../controllers/requestController");

router.post("/create", createRequest);
router.post("/approve", approveStage);
router.get("/:id", getRequestStatus);

module.exports = router;