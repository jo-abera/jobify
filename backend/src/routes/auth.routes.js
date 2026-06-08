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
//const { handleAvatarUpload } = require("../middleware/avatarUpload.middleware");

const router = express.Router();
const frontend = process.env.FRONTEND_URL || "http://localhost:5173";

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getMe);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);
router.patch("/update-password", protect, authController.updatePassword);

module.exports = router;
