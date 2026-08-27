const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");
const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
const dbName = "veltrix";
let client;

async function connectClient() {
  if (!client && uri) {
    client = new MongoClient(uri);
    await client.connect();
  }
}

async function createRepository(req, res) {
  const { owner, name, issues, content, description, visibility, isPrivate } = req.body || {};

  try {
    if (!name) {
      return res.status(400).json({ error: "Repository name is required!" });
    }

    let ownerId = owner;
    if (!ownerId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        ownerId = decoded.id;
      } catch (e) {
        // auth token decode fallback
      }
    }

    if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ error: "Invalid User ID!" });
    }

    const isVis = visibility !== undefined ? visibility : !isPrivate;

    const newRepository = new Repository({
      name,
      description,
      visibility: isVis,
      owner: ownerId,
      content: content || [],
      issues: issues || [],
    });

    const result = await newRepository.save();
    const populatedRepo = await Repository.findById(result._id).populate("owner");

    res.status(201).json({
      message: "Repository created!",
      repositoryID: result._id,
      repo: populatedRepo || result,
      repository: populatedRepo || result,
    });
  } catch (err) {
    console.error("Error during repository creation : ", err.message);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

async function getAllRepositories(req, res) {
  try {
    const repositories = await Repository.find({})
      .populate("owner")
      .populate("issues");

    res.json({ repositories, repos: repositories });
  } catch (err) {
    console.error("Error during fetching repositories : ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoryById(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.findById(id)
      .populate("owner")
      .populate("issues");

    res.json({ repository, repo: repository });
  } catch (err) {
    console.error("Error during fetching repository : ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoryByName(req, res) {
  const { name, owner } = req.params;
  try {
    let query = { name };

    if (owner) {
      if (mongoose.Types.ObjectId.isValid(owner)) {
        query.owner = owner;
      } else {
        await connectClient();
        if (client) {
          const db = client.db(dbName);
          const userObj = await db.collection("users").findOne({ username: owner });
          if (userObj) {
            query.owner = userObj._id;
          }
        }
      }
    }

    const repository = await Repository.findOne(query)
      .populate("owner")
      .populate("issues");

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json({ repository, repo: repository });
  } catch (err) {
    console.error("Error during fetching repository : ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoriesForCurrentUser(req, res) {
  const target = req.params.userID || req.params.username;

  try {
    let ownerId = target;
    if (target && !mongoose.Types.ObjectId.isValid(target)) {
      await connectClient();
      if (client) {
        const db = client.db(dbName);
        const userObj = await db.collection("users").findOne({ username: target });
        if (userObj) {
          ownerId = userObj._id;
        }
      }
    }

    const repositories = await Repository.find({ owner: ownerId }).populate("owner");

    res.json({ message: "Repositories found!", repositories, repos: repositories });
  } catch (err) {
    console.error("Error during fetching user repositories : ", err.message);
    res.status(500).send("Server error");
  }
}

async function updateRepositoryById(req, res) {
  const { id } = req.params;
  const { content, description } = req.body || {};

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    repository.content.push(content);
    repository.description = description;

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository updated successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during updating repository : ", err.message);
    res.status(500).send("Server error");
  }
}

async function toggleVisibilityById(req, res) {
  const { id } = req.params;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    repository.visibility = !repository.visibility;

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository visibility toggled successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during toggling visibility : ", err.message);
    res.status(500).send("Server error");
  }
}

async function deleteRepositoryById(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.findByIdAndDelete(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json({ message: "Repository deleted successfully!" });
  } catch (err) {
    console.error("Error during deleting repository : ", err.message);
    res.status(500).send("Server error");
  }
}

async function searchRepositories(req, res) {
  const { q } = req.query;
  try {
    const repositories = await Repository.find({
      $or: [
        { name: { $regex: q || "", $options: "i" } },
        { description: { $regex: q || "", $options: "i" } },
      ],
    })
      .populate("owner")
      .populate("issues");
    res.json(repositories);
  } catch (err) {
    console.error("Error during search : ", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoriesForCurrentUser,
  updateRepositoryById,
  toggleVisibilityById,
  deleteRepositoryById,
  searchRepositories,
};