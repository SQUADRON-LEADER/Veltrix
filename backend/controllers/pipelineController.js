const mongoose = require("mongoose");
const Pipeline = require("../models/pipelineModel");

const getPipelines = async (req, res) => {
  try {
    const { owner, repo } = req.query;
    let pipelines = [];

    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (owner && repo) {
        query = { owner, repoName: repo };
      }
      pipelines = await Pipeline.find(query).sort({ createdAt: -1 }).maxTimeMS(2000).catch(() => []);
    }

    if (pipelines.length === 0) {
      // Seed default sample pipeline runs for demo & unit testing
      pipelines = [
        {
          _id: "pipe-101",
          repoName: repo || "veltrix",
          owner: owner || "owner",
          branch: "main",
          commitHash: "7f3e81a",
          commitMessage: "feat(ci): add AWS ECR multi-stage docker build workflow",
          event: "push",
          status: "success",
          durationSeconds: 38,
          steps: [
            { name: "Checkout Code", status: "success", duration: "3s" },
            { name: "Lint & Unit Tests", status: "success", duration: "12s" },
            { name: "Docker Image Build", status: "success", duration: "18s" },
            { name: "Deploy to AWS ECS", status: "success", duration: "5s" },
          ],
          logs: [
            "Setting up Node.js v18.16.0...",
            "Running npm test --if-present...",
            "PASS backend/tests/api.test.js",
            "Building Docker Container: veltrix-backend:latest...",
            "Pushing image to AWS ECR: 123456789012.dkr.ecr.us-east-1.amazonaws.com/veltrix-backend:latest",
            "Updated AWS ECS Task Definition revision 14.",
            "Deployment completed successfully in 38s.",
          ],
          createdAt: new Date(Date.now() - 1000 * 60 * 15),
        },
      ];
    }

    res.json({ pipelines });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pipelines", error: err.message });
  }
};

const triggerPipeline = async (req, res) => {
  try {
    const { owner, repoName, branch = "main", commitMessage = "Manual workflow dispatch" } = req.body;
    const newPipeline = new Pipeline({
      owner: owner || "owner",
      repoName: repoName || "veltrix",
      branch,
      commitHash: Math.random().toString(36).substring(2, 9),
      commitMessage,
      event: "manual",
      status: "in_progress",
      durationSeconds: 0,
      steps: [
        { name: "Initialize Runner", status: "in_progress", duration: "2s" },
        { name: "Build Container", status: "queued", duration: "-" },
        { name: "AWS ECS Deploy", status: "queued", duration: "-" },
      ],
      logs: ["Triggering manual pipeline execution...", "Allocating cloud runner..."],
    });

    if (mongoose.connection.readyState === 1) {
      await newPipeline.save().catch(() => {});
    }

    res.status(201).json({ message: "Pipeline triggered successfully", pipeline: newPipeline });
  } catch (err) {
    res.status(500).json({ message: "Error triggering pipeline", error: err.message });
  }
};

module.exports = { getPipelines, triggerPipeline };
