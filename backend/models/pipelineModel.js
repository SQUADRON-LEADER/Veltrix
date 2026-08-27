const mongoose = require("mongoose");
const { Schema } = mongoose;

const PipelineSchema = new Schema({
  repoName: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    default: "main",
  },
  commitHash: {
    type: String,
    default: "a1b2c3d",
  },
  commitMessage: {
    type: String,
    default: "Automated build update",
  },
  event: {
    type: String,
    enum: ["push", "pull_request", "manual"],
    default: "push",
  },
  status: {
    type: String,
    enum: ["queued", "in_progress", "success", "failed"],
    default: "success",
  },
  durationSeconds: {
    type: Number,
    default: 42,
  },
  steps: [
    {
      name: String,
      status: String,
      duration: String,
    },
  ],
  logs: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Pipeline", PipelineSchema);
