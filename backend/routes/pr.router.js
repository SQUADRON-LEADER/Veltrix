const express = require("express");
const { getPullRequests, createPullRequest, mergePullRequest } = require("../controllers/prController");

const router = express.Router();

router.get("/", getPullRequests);
router.post("/", createPullRequest);
router.post("/:id/merge", mergePullRequest);

module.exports = router;
