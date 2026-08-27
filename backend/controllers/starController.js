const Repo = require('../models/repoModel');
const User = require('../models/userModel');

// Star a repository
exports.starRepo = async (req, res) => {
  try {
    const { owner, name } = req.params;
    const userId = req.user._id;

    const repo = await Repo.findOne({ owner, name });
    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    // Check if already starred
    if (repo.starredBy && repo.starredBy.includes(userId)) {
      return res.status(400).json({ message: 'Already starred' });
    }

    // Add user to starredBy array
    if (!repo.starredBy) repo.starredBy = [];
    repo.starredBy.push(userId);
    repo.stars = repo.starredBy.length;
    await repo.save();

    res.json({ message: 'Repository starred', stars: repo.stars });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unstar a repository
exports.unstarRepo = async (req, res) => {
  try {
    const { owner, name } = req.params;
    const userId = req.user._id;

    const repo = await Repo.findOne({ owner, name });
    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    // Remove user from starredBy array
    if (repo.starredBy) {
      repo.starredBy = repo.starredBy.filter(
        (id) => id.toString() !== userId.toString()
      );
      repo.stars = repo.starredBy.length;
      await repo.save();
    }

    res.json({ message: 'Repository unstarred', stars: repo.stars });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get starred repositories
exports.getStarred = async (req, res) => {
  try {
    const userId = req.user._id;

    const repos = await Repo.find({ starredBy: userId })
      .populate('owner', 'username')
      .sort({ updatedAt: -1 });

    res.json({ repos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
