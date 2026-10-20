const express = require("express");
const issueController = require("../controllers/issueController");

const issueRouter = express.Router();

// Legacy routes first
issueRouter.post("/issue/create", issueController.createIssue);
issueRouter.put("/issue/update/:id", issueController.updateIssue);
issueRouter.delete("/issue/delete/:id", issueController.deleteIssueById);
issueRouter.get("/issue/all/:id", issueController.listIssues);
issueRouter.get("/issue/:id", issueController.getIssue);

// Sub-resource routes
issueRouter.put("/:owner/:repo/:number/close", issueController.closeIssue);
issueRouter.put("/:owner/:repo/:number/reopen", issueController.reopenIssue);
issueRouter.post("/:owner/:repo/:number/comments", issueController.addComment);
issueRouter.get("/:owner/:repo/:number/comments", issueController.getComments);
issueRouter.post("/:owner/:repo/:number/labels", issueController.addLabel);
issueRouter.delete("/:owner/:repo/:number/labels/:label", issueController.removeLabel);

// 3-Segment issue routes
issueRouter.get("/:owner/:repo/:number", issueController.getIssue);
issueRouter.put("/:owner/:repo/:number", issueController.updateIssue);

// 2-Segment issue routes (list & create)
issueRouter.get("/:owner/:repo", issueController.listIssues);
issueRouter.post("/:owner/:repo", issueController.createIssue);

module.exports = issueRouter;