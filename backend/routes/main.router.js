const express = require("express");
const userRouter = require("./user.router");
const repoRouter = require("./repo.router");
const issueRouter = require("./issue.router");
const pipelineRouter = require("./pipeline.router");
const prRouter = require("./pr.router");
const securityRouter = require("./security.router");
const releaseRouter = require("./release.router");

const mainRouter = express.Router();

mainRouter.use("/users", userRouter);
mainRouter.use("/repos", repoRouter);
mainRouter.use("/issues", issueRouter);
mainRouter.use("/pipelines", pipelineRouter);
mainRouter.use("/pulls", prRouter);
mainRouter.use("/security", securityRouter);
mainRouter.use("/releases", releaseRouter);

mainRouter.use(userRouter);
mainRouter.use(repoRouter);
mainRouter.use(issueRouter);

const { s3, S3_BUCKET } = require("../config/aws-config");

mainRouter.get("/", (req, res) => {
  res.send("Welcome to Veltrix API!");
});

mainRouter.get("/aws/status", async (req, res) => {
  try {
    const data = await s3.listObjectsV2({ Bucket: S3_BUCKET, MaxKeys: 5 }).promise();
    res.json({
      status: "connected",
      bucket: S3_BUCKET,
      objectCount: data.Contents.length,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      bucket: S3_BUCKET,
      error: err.message,
    });
  }
});

module.exports = mainRouter;