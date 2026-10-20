const mongoose = require("mongoose");
const { Schema } = mongoose;

const RepositorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    content: [
      {
        type: String,
      },
    ],
    visibility: {
      type: Boolean,
      default: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issues: [
      {
        type: Schema.Types.ObjectId,
        ref: "Issue",
      },
    ],
    starredBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    stars: {
      type: Number,
      default: 0,
    },
    forks: {
      type: Number,
      default: 0,
    },
    forkedFrom: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
    },
    files: [
      {
        name: String,
        path: String,
        type: { type: String, default: "file" },
        size: Number,
        content: String,
      },
    ],
    commits: [
      {
        sha: String,
        message: String,
        author: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Repository = mongoose.model("Repository", RepositorySchema);
module.exports = Repository;