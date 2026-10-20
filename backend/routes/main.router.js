const express = require("express");
const userRouter = require("./user.router");
const repoRouter = require("./repo.router");
const issueRouter = require("./issue.router");
const pipelineRouter = require("./pipeline.router");
const prRouter = require("./pr.router");
const securityRouter = require("./security.router");
const releaseRouter = require("./release.router");

const userController = require("../controllers/userController");
const repoController = require("../controllers/repoController");

const { initRepo } = require("../controllers/init");
const { addRepo } = require("../controllers/add");
const { commitRepo } = require("../controllers/commit");
const { pushRepo } = require("../controllers/push");
const { pullRepo } = require("../controllers/pull");
const { revertRepo } = require("../controllers/revert");

const mainRouter = express.Router();

mainRouter.get("/", (req, res) => {
  res.send("Welcome to Veltrix API!");
});

mainRouter.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});

// Root auth & user aliases (for backwards compatibility)
mainRouter.post("/signup", userController.signup);
mainRouter.post("/login", userController.login);
mainRouter.get("/userProfile/:id", userController.getUserProfile);

// Root repo aliases (for Dashboard & legacy components)
mainRouter.get("/repo/all", repoController.getAllRepositories);
mainRouter.get("/repo/user/:userID", repoController.fetchRepositoriesForCurrentUser);
mainRouter.get("/repo/:id", repoController.fetchRepositoryById);
mainRouter.get("/repo/name/:name", repoController.fetchRepositoryByName);

// CLI Action endpoints
mainRouter.post("/init", async (req, res) => {
  try {
    await initRepo();
    res.json({ message: "Repository initialised!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

mainRouter.post("/add", async (req, res) => {
  try {
    const { file = "." } = req.body || {};
    await addRepo(file);
    res.json({ message: "File added to staging area!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

mainRouter.post("/commit", async (req, res) => {
  try {
    const { message = "Update" } = req.body || {};
    await commitRepo(message);
    res.json({ message: "Commit created!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

mainRouter.post("/push", async (req, res) => {
  try {
    await pushRepo();
    res.json({ message: "Commits pushed to remote storage!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

mainRouter.post("/pull", async (req, res) => {
  try {
    await pullRepo();
    res.json({ message: "Pulled commits from remote storage!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

mainRouter.post("/revert", async (req, res) => {
  try {
    const { commitID } = req.body || {};
    await revertRepo(commitID);
    res.json({ message: "Reverted commit!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Primary REST resource routers
mainRouter.use("/users", userRouter);
mainRouter.use("/repos", repoRouter);
mainRouter.use("/repo", repoRouter);
mainRouter.use("/issues", issueRouter);
mainRouter.use("/pipelines", pipelineRouter);
mainRouter.use("/pulls", prRouter);
mainRouter.use("/security", securityRouter);
mainRouter.use("/releases", releaseRouter);

// AWS status endpoint
const { s3, S3_BUCKET } = require("../config/aws-config");

mainRouter.get("/aws/status", async (req, res) => {
  try {
    const data = await s3.listObjectsV2({ Bucket: S3_BUCKET, MaxKeys: 5 }).promise();
    res.json({
      status: "connected",
      bucket: S3_BUCKET,
      objectCount: data.Contents ? data.Contents.length : 0,
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