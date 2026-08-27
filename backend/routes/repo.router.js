const express = require("express");
const repoController = require("../controllers/repoController");

const repoRouter = express.Router();

// Creation routes
repoRouter.post("/", repoController.createRepository);
repoRouter.post("/create", repoController.createRepository);
repoRouter.post("/repo/create", repoController.createRepository);

// Read / Search / Trending routes
repoRouter.get("/all", repoController.getAllRepositories);
repoRouter.get("/trending", repoController.getAllRepositories);
repoRouter.get("/search", repoController.searchRepositories);
repoRouter.get("/repo/all", repoController.getAllRepositories);

repoRouter.get("/user/:userID", repoController.fetchRepositoriesForCurrentUser);
repoRouter.get("/repo/user/:userID", repoController.fetchRepositoriesForCurrentUser);
repoRouter.get("/:username", repoController.fetchRepositoriesForCurrentUser);

repoRouter.get("/name/:name", repoController.fetchRepositoryByName);
repoRouter.get("/repo/name/:name", repoController.fetchRepositoryByName);
repoRouter.get("/:owner/:name", repoController.fetchRepositoryByName);
repoRouter.get("/repo/:id", repoController.fetchRepositoryById);

// Update / Delete / Toggle routes
repoRouter.put("/update/:id", repoController.updateRepositoryById);
repoRouter.put("/:owner/:name", repoController.updateRepositoryById);
repoRouter.delete("/delete/:id", repoController.deleteRepositoryById);
repoRouter.delete("/:owner/:name", repoController.deleteRepositoryById);
repoRouter.patch("/toggle/:id", repoController.toggleVisibilityById);

module.exports = repoRouter;