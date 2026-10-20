const express = require("express");
const userController = require("../controllers/userController");
const followController = require("../controllers/followController");
const authMiddleware = require("../middleware/authMiddleware");

const userRouter = express.Router();

// Specific routes first
userRouter.get("/me", userController.getMe);
userRouter.get("/allUsers", userController.getAllUsers);
userRouter.get("/search", userController.searchUsers);
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);

// Authenticated current user actions
userRouter.put("/profile", authMiddleware, userController.updateCurrentProfile);
userRouter.put("/password", authMiddleware, userController.changePassword);
userRouter.delete("/account", authMiddleware, userController.deleteAccount);

// Legacy ID-based routes
userRouter.get("/userProfile/:id", userController.getUserProfile);
userRouter.put("/updateProfile/:id", userController.updateUserProfile);
userRouter.delete("/deleteProfile/:id", userController.deleteUserProfile);

// Follow / Activity routes
userRouter.post("/:username/follow", authMiddleware, followController.followUser);
userRouter.delete("/:username/follow", authMiddleware, followController.unfollowUser);
userRouter.get("/:username/followers", followController.getFollowers);
userRouter.get("/:username/following", followController.getFollowing);
userRouter.get("/:username/activity", userController.getActivity);

// Parameterized username profile (must be after /search, /profile, /me)
userRouter.get("/:username", userController.getUserProfile);

module.exports = userRouter;