const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const User = require("../models/userModel");

dotenv.config();
const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
const dbName = "veltrix";

let client;

function isDbError(err) {
  if (!err) return false;
  return (
    err.name === "MongoServerSelectionError" ||
    err.name === "MongoNetworkError" ||
    err.name === "MongoTimeoutError" ||
    err.name === "MongooseServerSelectionError" ||
    err.code === "ENOTFOUND" ||
    (typeof err.message === "string" &&
      (err.message.includes("ENOTFOUND") ||
        err.message.includes("querySrv") ||
        err.message.includes("buffering timed out") ||
        err.message.includes("failed to connect to server")))
  );
}

async function connectClient() {
  if (!uri) {
    throw new Error("MongoDB connection URI is not configured");
  }

  if (!client) {
    try {
      client = new MongoClient(uri);
      await client.connect();
    } catch (err) {
      client = null;
      throw err;
    }
  }
}

function getJwtSecret() {
  return (
    process.env.JWT_SECRET_KEY ||
    process.env.JWT_SECRET ||
    "default_jwt_secret"
  );
}

async function signup(req, res) {
  const { username, password, email } = req.body || {};
  try {
    if (!username || !password || !email) {
      return res.status(400).json({
        message: "Username, email, and password are required",
      });
    }

    const jwtSecret = getJwtSecret();

    await connectClient();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({
      $or: [{ username }, { email }],
    });
    if (user) {
      return res.status(409).json({
        message:
          user.username === username
            ? "Username is already in use"
            : "Email is already registered",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await usersCollection.insertOne({
      username,
      email,
      password: hashedPassword,
      bio: "",
      location: "",
      website: "",
      avatar: "",
      repositories: [],
      followedUsers: [],
      followers: [],
      following: [],
      starRepos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const token = jwt.sign(
      { id: result.insertedId },
      jwtSecret,
      { expiresIn: "7d" }
    );
    const safeUser = {
      _id: result.insertedId,
      id: result.insertedId,
      username,
      email,
      bio: "",
      location: "",
      website: "",
      followers: 0,
      following: 0,
    };
    res.status(201).json({ token, userId: result.insertedId, user: safeUser });
  } catch (err) {
    console.error("Error during signup : ", err.message);
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern || {})[0];
      return res.status(409).json({
        message:
          duplicateField === "email"
            ? "Email is already registered"
            : "Username is already in use",
      });
    }
    if (isDbError(err)) {
      return res.status(503).json({
        message:
          "Database service is unavailable. Please check MongoDB connection.",
      });
    }
    res.status(500).json({ message: "Unable to create account" });
  }
}

async function login(req, res) {
  const { email, username, password } = req.body || {};
  try {
    const identifier = email || username;
    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Username/email and password are required" });
    }

    const jwtSecret = getJwtSecret();

    await connectClient();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, {
      expiresIn: "7d",
    });
    const { password: _, ...safeUser } = user;
    safeUser.id = user._id;
    safeUser.followers = (user.followers || []).length;
    safeUser.following = (user.following || []).length;

    res.json({ token, userId: user._id, user: safeUser });
  } catch (err) {
    console.error("Error during login : ", err.message);
    if (isDbError(err)) {
      return res.status(503).json({
        message:
          "Database service is unavailable. Please check MongoDB connection.",
      });
    }
    res.status(500).json({ message: "Unable to log in" });
  }
}

async function getAllUsers(req, res) {
  try {
    await connectClient();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    const users = await usersCollection
      .find({})
      .project({ password: 0 })
      .toArray();
    res.json(users);
  } catch (err) {
    console.error("Error during fetching users: ", err.message);
    if (isDbError(err)) {
      return res.status(503).json({
        message: "Database service is unavailable.",
      });
    }
    res.status(500).json({ message: "Server error!" });
  }
}

async function getUserProfile(req, res) {
  const target = req.params.id || req.params.username;

  try {
    await connectClient();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    let query = {};
    if (ObjectId.isValid(target) && target.length === 24) {
      query = { $or: [{ _id: new ObjectId(target) }, { username: target }] };
    } else {
      query = { username: target };
    }

    const user = await usersCollection.findOne(query);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const { password: _, ...safeUser } = user;
    safeUser.followers = (user.followers || []).length;
    safeUser.following = (user.following || []).length;

    // Support both res.data.user and res.data
    res.json({ user: safeUser, ...safeUser });
  } catch (err) {
    console.error("Error during fetching profile: ", err.message);
    if (isDbError(err)) {
      return res.status(503).json({
        message: "Database service is unavailable.",
      });
    }
    res.status(500).json({ message: "Server error!" });
  }
}

async function updateUserProfile(req, res) {
  const currentID = req.params.id;
  const { email, password, bio, location, website } = req.body || {};

  try {
    await connectClient();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    let updateFields = { updatedAt: new Date() };
    if (email) updateFields.email = email;
    if (bio !== undefined) updateFields.bio = bio;
    if (location !== undefined) updateFields.location = location;
    if (website !== undefined) updateFields.website = website;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.password = hashedPassword;
    }

    let query = {};
    if (ObjectId.isValid(currentID) && currentID.length === 24) {
      query = { _id: new ObjectId(currentID) };
    } else {
      query = { username: currentID };
    }

    const result = await usersCollection.findOneAndUpdate(
      query,
      { $set: updateFields },
      { returnDocument: "after", projection: { password: 0 } }
    );
    if (!result) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.json(result);
  } catch (err) {
    console.error("Error during updating: ", err.message);
    if (isDbError(err)) {
      return res.status(503).json({
        message: "Database service is unavailable.",
      });
    }
    res.status(500).json({ message: "Server error!" });
  }
}

async function updateCurrentProfile(req, res) {
  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { bio, location, website, email } = req.body || {};
  try {
    await connectClient();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    let updateFields = { updatedAt: new Date() };
    if (bio !== undefined) updateFields.bio = bio;
    if (location !== undefined) updateFields.location = location;
    if (website !== undefined) updateFields.website = website;
    if (email) updateFields.email = email;

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateFields },
      { returnDocument: "after", projection: { password: 0 } }
    );

    res.json({ message: "Profile updated successfully", user: result });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update profile" });
  }
}

async function changePassword(req, res) {
  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { currentPassword, newPassword } = req.body || {};
  try {
    await connectClient();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.password && currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password does not match" });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to change password" });
  }
}

async function deleteAccount(req, res) {
  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    await connectClient();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    await usersCollection.deleteOne({ _id: new ObjectId(userId) });
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete account" });
  }
}

async function deleteUserProfile(req, res) {
  const currentID = req.params.id;

  try {
    await connectClient();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    let query = {};
    if (ObjectId.isValid(currentID) && currentID.length === 24) {
      query = { _id: new ObjectId(currentID) };
    } else {
      query = { username: currentID };
    }

    const result = await usersCollection.deleteOne(query);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.json({ message: "User Profile Deleted!" });
  } catch (err) {
    res.status(500).json({ message: "Server error!" });
  }
}

async function searchUsers(req, res) {
  const { q } = req.query;
  try {
    await connectClient();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    const query = q
      ? {
          $or: [
            { username: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const users = await usersCollection
      .find(query)
      .project({ password: 0 })
      .limit(20)
      .toArray();

    res.json({ users, count: users.length });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error searching users" });
  }
}

async function getActivity(req, res) {
  const { username } = req.params;
  res.json({
    activities: [
      {
        id: "act-1",
        type: "commit",
        repo: "veltrix",
        message: "Initial release commit",
        date: new Date(),
      },
    ],
  });
}

async function getMe(req, res) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    await connectClient();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.id) });
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password: _, ...safeUser } = user;
    safeUser.followers = (user.followers || []).length;
    safeUser.following = (user.following || []).length;
    res.json({ user: safeUser, ...safeUser });
  } catch (err) {
    console.error("getMe error:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = {
  getAllUsers,
  signup,
  login,
  getMe,
  getUserProfile,
  updateUserProfile,
  updateCurrentProfile,
  changePassword,
  deleteAccount,
  deleteUserProfile,
  searchUsers,
  getActivity,
};
