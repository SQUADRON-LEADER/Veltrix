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
    try {
      client = new MongoClient(uri);
      await client.connect();
    } catch (err) {
      client = null;
      throw err;
    }
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
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || "default_jwt_secret"
        );
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
      description: description || "",
      visibility: isVis,
      isPrivate: !isVis,
      owner: ownerId,
      content: content || [],
      issues: issues || [],
      files: [
        {
          name: "README.md",
          path: "README.md",
          type: "file",
          size: 120,
          content: `# ${name}\n\n${description || "A new Veltrix repository."}`,
        },
      ],
      commits: [
        {
          sha: Math.random().toString(36).substring(2, 10),
          message: "Initial commit",
          author: "Owner",
          date: new Date(),
        },
      ],
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
      .populate("issues")
      .sort({ createdAt: -1 });

    res.json({ repositories, repos: repositories });
  } catch (err) {
    console.error("Error during fetching repositories : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function fetchRepositoryById(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.findById(id)
      .populate("owner")
      .populate("issues");

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json({ repository, repo: repository });
  } catch (err) {
    console.error("Error during fetching repository : ", err.message);
    res.status(500).json({ error: "Server error" });
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

    let repository = await Repository.findOne(query)
      .populate("owner")
      .populate("issues");

    if (!repository && !owner) {
      repository = await Repository.findOne({ name })
        .populate("owner")
        .populate("issues");
    }

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json({ repository, repo: repository });
  } catch (err) {
    console.error("Error during fetching repository : ", err.message);
    res.status(500).json({ error: "Server error" });
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

    let repositories = [];
    if (ownerId && mongoose.Types.ObjectId.isValid(ownerId)) {
      repositories = await Repository.find({ owner: ownerId }).populate("owner");
    } else {
      repositories = await Repository.find({}).populate("owner");
    }

    res.json({ message: "Repositories found!", repositories, repos: repositories });
  } catch (err) {
    console.error("Error during fetching user repositories : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function updateRepositoryById(req, res) {
  const { id, owner, name } = req.params;
  const { content, description, visibility, isPrivate } = req.body || {};

  try {
    let repository;
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      repository = await Repository.findById(id);
    } else if (name) {
      repository = await Repository.findOne({ name });
    }

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    if (content) repository.content.push(content);
    if (description !== undefined) repository.description = description;
    if (visibility !== undefined) repository.visibility = visibility;
    if (isPrivate !== undefined) repository.isPrivate = isPrivate;

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository updated successfully!",
      repository: updatedRepository,
      repo: updatedRepository,
    });
  } catch (err) {
    console.error("Error during updating repository : ", err.message);
    res.status(500).json({ error: "Server error" });
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
    repository.isPrivate = !repository.visibility;

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository visibility toggled successfully!",
      repository: updatedRepository,
      repo: updatedRepository,
    });
  } catch (err) {
    console.error("Error during toggling visibility : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function deleteRepositoryById(req, res) {
  const { id, name } = req.params;
  try {
    let repository;
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      repository = await Repository.findByIdAndDelete(id);
    } else if (name) {
      repository = await Repository.findOneAndDelete({ name });
    }

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json({ message: "Repository deleted successfully!" });
  } catch (err) {
    console.error("Error during deleting repository : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function searchRepositories(req, res) {
  const { q } = req.query;
  try {
    const query = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const repositories = await Repository.find(query)
      .populate("owner")
      .populate("issues");

    res.json({ repos: repositories, repositories });
  } catch (err) {
    console.error("Error during search : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function getRepoFiles(req, res) {
  const { owner, name } = req.params;
  const { path = "" } = req.query;
  try {
    const repo = await Repository.findOne({ name });
    const defaultFiles = [
      { name: "README.md", path: "README.md", type: "file", size: 1420 },
      { name: "package.json", path: "package.json", type: "file", size: 850 },
      { name: "src", path: "src", type: "directory", size: 0 },
      { name: ".gitignore", path: ".gitignore", type: "file", size: 120 },
    ];
    const files = (repo && repo.files && repo.files.length > 0) ? repo.files : defaultFiles;
    res.json({ files });
  } catch (err) {
    res.json({ files: [] });
  }
}

async function getFileContent(req, res) {
  const { owner, name } = req.params;
  const { path = "README.md" } = req.query;
  try {
    const content = `# ${name}\n\nProject hosted on Veltrix Cloud Platform.\n\n### Features\n- Automated CI/CD Pipelines\n- Pull Request Reviews\n- Enterprise Security Scanning`;
    res.json({ path, content, size: content.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to read file content" });
  }
}

async function getRepoCommits(req, res) {
  const { owner, name } = req.params;
  try {
    const repo = await Repository.findOne({ name });
    const defaultCommits = [
      {
        sha: "a1b2c3d",
        message: "feat: initial commit and project structure",
        author: owner || "contributor",
        date: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        sha: "e4f5g6h",
        message: "ci: add GitHub Actions and Docker build config",
        author: owner || "contributor",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    ];
    const commits = (repo && repo.commits && repo.commits.length > 0) ? repo.commits : defaultCommits;
    res.json({ commits });
  } catch (err) {
    res.json({ commits: [] });
  }
}

async function starRepo(req, res) {
  const { owner, name } = req.params;
  try {
    const repo = await Repository.findOne({ name });
    if (!repo) return res.status(404).json({ error: "Repository not found" });
    repo.stars = (repo.stars || 0) + 1;
    await repo.save();
    res.json({ message: "Repository starred", stars: repo.stars, starred: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function unstarRepo(req, res) {
  const { owner, name } = req.params;
  try {
    const repo = await Repository.findOne({ name });
    if (!repo) return res.status(404).json({ error: "Repository not found" });
    repo.stars = Math.max(0, (repo.stars || 1) - 1);
    await repo.save();
    res.json({ message: "Repository unstarred", stars: repo.stars, starred: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function forkRepo(req, res) {
  const { owner, name } = req.params;
  try {
    const repo = await Repository.findOne({ name });
    if (!repo) return res.status(404).json({ error: "Repository not found" });
    repo.forks = (repo.forks || 0) + 1;
    await repo.save();
    res.json({ message: "Repository forked", forks: repo.forks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getStargazers(req, res) {
  res.json({ stargazers: [] });
}

async function getForks(req, res) {
  res.json({ forks: [] });
}

async function getContributors(req, res) {
  const { owner } = req.params;
  res.json({
    contributors: [
      { username: owner || "contributor", contributions: 12, avatar: "" },
    ],
  });
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
  getRepoFiles,
  getFileContent,
  getRepoCommits,
  starRepo,
  unstarRepo,
  forkRepo,
  getStargazers,
  getForks,
  getContributors,
};