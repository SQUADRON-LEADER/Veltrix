const mongoose = require("mongoose");
const { Schema } = mongoose;

const SecurityAlertSchema = new Schema({
  repoName: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  packageName: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ["critical", "high", "moderate", "low"],
    required: true,
  },
  vulnerability: {
    type: String,
    required: true,
  },
  fixVersion: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "dismissed", "fixed"],
    default: "open",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SecurityAlert", SecurityAlertSchema);
