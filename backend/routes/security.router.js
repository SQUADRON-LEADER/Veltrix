const express = require("express");
const { getSecurityAlerts, runSecurityScan } = require("../controllers/securityController");

const router = express.Router();

router.get("/", getSecurityAlerts);
router.post("/scan", runSecurityScan);

module.exports = router;
