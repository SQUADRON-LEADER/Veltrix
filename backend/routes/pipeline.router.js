const express = require("express");
const { getPipelines, triggerPipeline } = require("../controllers/pipelineController");

const router = express.Router();

router.get("/", getPipelines);
router.post("/trigger", triggerPipeline);

module.exports = router;
