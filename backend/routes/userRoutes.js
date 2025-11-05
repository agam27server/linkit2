import express from "express";
import {
  registerUser,
  loginUser,
  getPopularProfiles,
  getPublicProfile,
  updateProfileImage,
  getLoggedInUserProfile,
  renderLogin,
  renderRegister,
  renderDashboard,
  renderPublicProfile,
  renderRankings,
  logoutUser,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// EJS View Routes
router.get("/login", renderLogin);
router.get("/register", renderRegister);
router.get("/dashboard", authMiddleware, renderDashboard);
router.get("/profile/:username", renderPublicProfile);
router.get("/rankings", renderRankings);
router.get("/logout", logoutUser);

// API Routes
router.post("/register", upload.single("profileImage"), registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser); // API endpoint for logout
router.get("/api/profile/:username", getPublicProfile);

// Protected API routes
router.get("/api/me", authMiddleware, getLoggedInUserProfile);
router.get("/api/popular-profiles", getPopularProfiles);
router.put(
  "/api/users/update-profile-image",
  authMiddleware,
  upload.single("profileImage"),
  updateProfileImage
);

export default router;
