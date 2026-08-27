const User = require('../models/userModel');

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user._id;

    // Find the user to follow
    const userToFollow = await User.findOne({ username });
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Can't follow yourself
    if (userToFollow._id.toString() === currentUserId.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Get current user
    const currentUser = await User.findById(currentUserId);

    // Check if already following
    if (!currentUser.following) currentUser.following = [];
    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ message: 'Already following' });
    }

    // Add to following
    currentUser.following.push(userToFollow._id);
    await currentUser.save();

    // Add to followers
    if (!userToFollow.followers) userToFollow.followers = [];
    userToFollow.followers.push(currentUserId);
    await userToFollow.save();

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user._id;

    // Find the user to unfollow
    const userToUnfollow = await User.findOne({ username });
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get current user
    const currentUser = await User.findById(currentUserId);

    // Remove from following
    if (currentUser.following) {
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== userToUnfollow._id.toString()
      );
      await currentUser.save();
    }

    // Remove from followers
    if (userToUnfollow.followers) {
      userToUnfollow.followers = userToUnfollow.followers.filter(
        (id) => id.toString() !== currentUserId.toString()
      );
      await userToUnfollow.save();
    }

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get followers
exports.getFollowers = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).populate(
      'followers',
      'username email'
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ followers: user.followers || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get following
exports.getFollowing = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).populate(
      'following',
      'username email'
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ following: user.following || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
