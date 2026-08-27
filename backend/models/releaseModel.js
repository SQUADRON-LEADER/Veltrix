const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReleaseSchema = new Schema({
  repoName: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  tagName: {
    type: String,
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
  isPrerelease: {
    type: Boolean,
    default: false,
  },
  assetsCount: {
    type: Number,
    default: 2,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Release", ReleaseSchema);
