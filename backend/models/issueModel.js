const mongoose = require("mongoose");
const { Schema } = mongoose;

const IssueSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    number: {
      type: Number,
      default: 1,
    },
    owner: {
      type: String,
    },
    repoName: {
      type: String,
    },
    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
    },
    author: {
      type: Schema.Types.Mixed,
      default: () => ({ username: "user" }),
    },
    labels: [
      {
        type: String,
      },
    ],
    comments: [
      {
        author: {
          type: Schema.Types.Mixed,
          default: () => ({ username: "user" }),
        },
        comment: String,
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Issue = mongoose.model("Issue", IssueSchema);
module.exports = Issue;