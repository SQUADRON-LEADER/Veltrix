const express = require("express");
const { getReleases, createRelease } = require("../controllers/releaseController");

const router = express.Router();

router.get("/", getReleases);
router.post("/", createRelease);

module.exports = router;
