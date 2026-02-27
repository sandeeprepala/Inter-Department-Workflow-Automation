const router = require("express").Router();
const { createWorkflow } = require("../controllers/workflowController");

router.post("/create", createWorkflow);

module.exports = router;