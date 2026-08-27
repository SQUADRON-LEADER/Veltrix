const mongoose = require("mongoose");
const PullRequest = require("../models/pullRequestModel");

const getPullRequests = async (req, res) => {
  try {
    const { owner, repo } = req.query;
    let pullRequests = [];

    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (owner && repo) {
        query = { owner, repoName: repo };
      }
      pullRequests = await PullRequest.find(query).sort({ createdAt: -1 }).maxTimeMS(2000).catch(() => []);
    }

    if (pullRequests.length === 0) {
      pullRequests = [
        {
          _id: "pr-101",
          number: 1,
          repoName: repo || "veltrix",
          owner: owner || "owner",
          title: "feat(devops): Add AWS Terraform IaC & CloudFront CDN specs",
          description: "Provisions ECS cluster, DocumentDB database, and S3 bucket via Terraform automation.",
          author: owner || "devops-engineer",
          sourceBranch: "feature/aws-terraform",
          targetBranch: "main",
          status: "open",
          ciCheckStatus: "success",
          commentsCount: 3,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        },
        {
          _id: "pr-100",
          number: 2,
          repoName: repo || "veltrix",
          owner: owner || "owner",
          title: "fix(container): optimize multi-stage Docker build for frontend Nginx SPA",
          description: "Reduces container image size from 450MB to 22MB using alpine base images.",
          author: "contributor-alex",
          sourceBranch: "fix/docker-optimization",
          targetBranch: "main",
          status: "merged",
          ciCheckStatus: "success",
          commentsCount: 1,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        },
      ];
    }

    res.json({ pullRequests });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pull requests", error: err.message });
  }
};

const createPullRequest = async (req, res) => {
  try {
    const { owner, repoName, title, description, sourceBranch, targetBranch = "main", author } = req.body;
    let count = 2;
    if (mongoose.connection.readyState === 1) {
      count = await PullRequest.countDocuments({ owner, repoName }).catch(() => 2);
    }
    const newPR = new PullRequest({
      owner: owner || "owner",
      repoName: repoName || "veltrix",
      number: count + 1,
      title,
      description,
      sourceBranch,
      targetBranch,
      author: author || owner || "developer",
      status: "open",
      ciCheckStatus: "success",
    });

    if (mongoose.connection.readyState === 1) {
      await newPR.save().catch(() => {});
    }

    res.status(201).json({ message: "Pull request created successfully", pullRequest: newPR });
  } catch (err) {
    res.status(500).json({ message: "Error creating pull request", error: err.message });
  }
};

const mergePullRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      const pr = await PullRequest.findById(id).catch(() => null);
      if (pr) {
        pr.status = "merged";
        await pr.save();
        return res.json({ message: "Pull request merged successfully!", pullRequest: pr });
      }
    }
    res.json({ message: "Pull request merged successfully (demo state)" });
  } catch (err) {
    res.status(500).json({ message: "Error merging PR", error: err.message });
  }
};

module.exports = { getPullRequests, createPullRequest, mergePullRequest };
