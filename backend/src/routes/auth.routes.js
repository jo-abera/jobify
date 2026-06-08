/**
 * Auth routes — /api/auth/*
 *
 * Public: register, login, forgot/reset password, Google OAuth redirect.
 * Protected (protect middleware): me, profile, preferences, security actions.
 */

const express = require("express");
const passport = require("passport");
require("../config/passport");
const authController = require("../controllers/auth.controller");
const protect = require("../middleware/auth.middleware");
const { handleAvatarUpload } = require("../middleware/avatarUpload.middleware");

const router = express.Router();
const frontend = process.env.FRONTEND_URL || "http://localhost:5173";

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getMe);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);
router.patch("/update-password", protect, authController.updatePassword);
router.patch("/profile", protect, authController.updateProfile);
router.patch("/preferences", protect, authController.updatePreferences);
router.post(
  "/avatar",
  protect,
  handleAvatarUpload,
  authController.uploadAvatar,
);
router.delete("/delete-account", protect, authController.deleteAccount);

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get(
    "/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    }),
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", {
      session: false,
      failureRedirect: `${frontend}/login?error=google_failed`,
    }),
    authController.googleCallback,
  );
} else {
  router.get("/google", (req, res) => {
    res
      .status(503)
      .json({ message: "Google sign-in is not configured on the server" });
  });
}

module.exports = router;
