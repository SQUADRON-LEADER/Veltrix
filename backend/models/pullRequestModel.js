const mongoose = require("mongoose");
const { Schema } = mongoose;

const PullRequestSchema = new Schema({
  repoName: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  author: {
    type: String,
    required: true,
  },
  sourceBranch: {
    type: String,
    required: true,
  },
  targetBranch: {
    type: String,
    default: "main",
  },
  status: {
    type: String,
    enum: ["open", "merged", "closed"],
    default: "open",
  },
  ciCheckStatus: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "success",
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PullRequest", PullRequestSchema);
