const express = require("express");
const repoController = require("../controllers/repoController");

const repoRouter = express.Router();

// 1. Static Creation routes
repoRouter.post("/", repoController.createRepository);
repoRouter.post("/create", repoController.createRepository);
repoRouter.post("/repo/create", repoController.createRepository);

// 2. Static Read / Search / Trending routes
repoRouter.get("/all", repoController.getAllRepositories);
repoRouter.get("/trending", repoController.getAllRepositories);
repoRouter.get("/search", repoController.searchRepositories);
repoRouter.get("/repo/all", repoController.getAllRepositories);

// 3. User & ID-specific routes
repoRouter.get("/user/:userID", repoController.fetchRepositoriesForCurrentUser);
repoRouter.get("/repo/user/:userID", repoController.fetchRepositoriesForCurrentUser);
repoRouter.get("/repo/:id", repoController.fetchRepositoryById);
repoRouter.get("/name/:name", repoController.fetchRepositoryByName);
repoRouter.get("/repo/name/:name", repoController.fetchRepositoryByName);

// 4. Update / Delete / Toggle routes
repoRouter.put("/update/:id", repoController.updateRepositoryById);
repoRouter.delete("/delete/:id", repoController.deleteRepositoryById);
repoRouter.patch("/toggle/:id", repoController.toggleVisibilityById);

// 5. 3-Segment Repository sub-resource routes
repoRouter.get("/:owner/:name/files", repoController.getRepoFiles);
repoRouter.get("/:owner/:name/content", repoController.getFileContent);
repoRouter.get("/:owner/:name/commits", repoController.getRepoCommits);
repoRouter.get("/:owner/:name/commits/:sha", repoController.getRepoCommits);
repoRouter.post("/:owner/:name/star", repoController.starRepo);
repoRouter.delete("/:owner/:name/star", repoController.unstarRepo);
repoRouter.post("/:owner/:name/fork", repoController.forkRepo);
repoRouter.get("/:owner/:name/stargazers", repoController.getStargazers);
repoRouter.get("/:owner/:name/forks", repoController.getForks);
repoRouter.get("/:owner/:name/contributors", repoController.getContributors);

// 6. 2-Segment Repository routes
repoRouter.get("/:owner/:name", repoController.fetchRepositoryByName);
repoRouter.put("/:owner/:name", repoController.updateRepositoryById);
repoRouter.delete("/:owner/:name", repoController.deleteRepositoryById);

// 7. 1-Segment User repositories route (must come after static routes)
repoRouter.get("/:username", repoController.fetchRepositoriesForCurrentUser);

module.exports = repoRouter;