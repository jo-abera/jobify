/**
 * Authentication controller.
 *
 * Email/password register & login, password reset, update password, and
 * Google OAuth callback (Passport). All handlers use plain try/catch.
 * Token responses use signAndSend for a consistent { status, token, data } shape.
 */

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const prisma = require("../config/db");
const Email = require("../utils/email");
const cloudinary = require('../utils/cloudinary')

//const { OAuth2Client } = require("google-auth-library");
// const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const GOOGLE_PLACEHOLDER_PASSWORD = "GOOGLE_OAUTH_NO_PASSWORD";
const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract"];
const WORK_MODES = ["Remote", "On-site", "Hybrid"];

/** Safe user fields retured to the client (never include secrets) */
const PublicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  location: true,
  phone: true,
  bio: true,
  skills: true,
  preferredJobTypes: true,
  preferredWorkModes: true,
  salaryExpectationMin: true,
  salaryExpectationMax: true,
  isVerified: true,
  createdAt: true,
};

/**
 * Signs JWT and responds with token + public user profile.
 * Mutates user object to strip sensitive fields before serialization.
 */

// It is used to generate a token and send response after login/register.
//

const signAndSend = (user, statusCode, res) => {
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    location: user.location,
    phone: user.phone,
    bio: user.bio,
    skills: user.skills,
    preferredJobTypes: user.preferredJobTypes,
    preferredWorkModes: user.preferredWorkModes,
    salaryExpectationMin: user.salaryExpectationMin,
    salaryExpectationMax: user.salaryExpectationMax,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user: safeUser },
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    // Basic validation inputs are required
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email and password to register.",
      });
    }
    // Password strength Validation: at least 6 characters, at least one letter and one number using regex
    const strongPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!strongPassword.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long and contain at least one letter and one number.",
      });
    }

    //  Check if the email is already in use. If it is, return an error
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Email already in use. Please login instead." });
    }

    // Hash the password using Bcrypt before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user in the database
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, isVerified: true },
    });

    // Send a welcome email to the user. If the email is not configured, Log a message to the console and continue without failing the registration process
    if (Email.isConfigured()) {
      try {
        const url = `${process.env.FRONTEND_URL || "http://localhost:5173"}/jobs`;
        await new Email(newUser, url).sendWelcome();
      } catch (emailErr) {
        console.log("Welcome email faild:", emailErr.message);
      }
    }

    signAndSend(newUser, 201, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration faild. Please try again." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // 1. Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        message: " Please provide email and password to login",
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    if (user.password === GOOGLE_PLACEHOLDER_PASSWORD) {
      return res.status(401).json({
        message:
          "This account uses Google login. Please sign in with Google or reset your password to set a new one.",
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        message: "Your account has been banned",
      });
    }

    signAndSend(user, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
};

/**
 * Passport success handler — issues JWT and redirects to frontend /auth/callback.
 * req.user is set by passport.authenticate in auth.routes.
 */
exports.googleCallback = (req, res) => {
  try {
    const frontend = process.env.FRONTEND_URL || "http://localhost:5173";

    if (req.user?.isBanned) {
      return res.redirect(`${frontend}/login?error=banned`);
    }

    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
    res.redirect(`${frontend}/auth/callback?token=${token}`);
  } catch (err) {
    const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontend}/login?error=google_failed`);
  }
};

/** Client clears localStorage token; included for API symmetry. */
exports.logout = async (req, res) => {
  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully" });
};

// Get the current logged in user's profile. Protected route, requires auth middleware.
exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: PublicUserSelect,
    });
    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not get user profile." });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ message: "Please provide your email address." });
    }
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ message: "There is no user with that email address." });
    }

    if (user.password === GOOGLE_PLACEHOLDER_PASSWORD) {
      return res.status(400).json({
        message: "This account uses Google login. Sign in with Google instead.",
      });
    }

    // It is used to generate a reset token and hash it.
    // Generates a 32-byte random token and converts it to a hex string — this becomes the reset link token
    // This is the token you send to the user via email. So the user can click the link to reset their password.
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hashes the token with SHA-256 before storing it in the database. So even if the DB is leaked, attackers can't use the raw token to reset passwords.
    // This ensures the token is secure and can't be tampered with.
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // It is used to update the user's password reset token and expiration.
    // Stores the hashed token and sets an expiration time (10 minutes from now).
    // This ensures the token is only valid for a short period of time.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      },
    });

    // It is used to generate a reset URL.
    // Combines the frontend URL with the reset token to create a valid reset link.
    const resetURL = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    if (!Email.isConfigured()) {
      console.log("[dev] Password reset URL (email not configured):", resetURL);
      return res.status(200).json({
        status: "success",
        message: "Reset logged to server console (email not configured)",
      });
    }

    try {
      await new Email(user, resetURL).sendPasswordReset();
      return res.status(200).json({
        status: "success",
        message: "Password reset link sent to your email",
      });
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordResetToken: null, passwordResetExpires: null },
      });
      return res.status(500).json({
        message:
          "There was an error sending the email. Please try again later.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "something went wrong" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Please provide a new password" });
    }

    // Takes the token from the URL (req.params.token), hashes it, then looks up the matching hash in the DB
    // This is the token you get from the user's email. So you can verify it's valid and not expired.
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        // Looks for the hashed token in the DB.
        passwordResetToken: hashedToken,
        // greater than refers to the hashed token expiration time is in the future.
        passwordResetExpires: { gt: new Date() },
      },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        passwordChangedAt: new Date(),
      },
    });

    signAndSend(updated, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Password reset failed" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { passwordCurrent, password } = req.body;

    if (!passwordCurrent || !password) {
      return res
        .status(400)
        .json({ message: "Please provide current and new password" });
    }
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user.password === GOOGLE_PLACEHOLDER_PASSWORD) {
      return res.status(400).json({
        message:
          "Google accounts cannot change password here. use Google sign-in",
      });
    }
    // Before changing password, verifies the current password is correct — prevents someone who grabbed an unlocked screen from changing the password
    // Compares the submitted current password (passwordCurrent) against the stored user password (user.password)
    if (!(await bcrypt.compare(passwordCurrent, user.password))) {
      return res
        .status(401)
        .json({ message: "Your current password is wrong" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    signAndSend(updated, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Password update failed." });
  }
};

/**
 * Carrer profile update endpoint.
 *
 * Handles tab 1 fields: avatar, name, contact info, bio and skill tags.
 * Keeps shape strict so frontend state stays pridctable.
 *
 */

exports.updateProfile = async (req, res) => {
  try {
    const { avatar, name, location, phone, bio, skills } = req.body;

    let normalizedSkills = undefined;

    if (skills !== undefined) {
      // Validation: Ensure "skills" is an array of strings.
      // Rejects invalid input such as non-array values.
      if (!Array.isArray(skills)) {
        return res
          .status(400)
          .json({ message: "Skills must be an array of strings." });
      }
      normalizedSkills = skills
        .map((skill) => String(skill).trim()) // Converts each skill to a string and trims whitespace.
        .filter(Boolean) //removes falsy values (empty strings, null, etc.)
        .slice(0, 50); // Limits the array to 50 skills.
    }

    /**!== undefined :- means Did the user send this field?
     *
     *  USING Tertary Operator
     *
     * If "avatar" is provided, convert it to a string, trim whitespace, and set it to null if it becomes empty.
     * If "avatar" is not provided (undefined), keep it as undefined so it can be ignored in the update logic.
     *
     * Checks whether "avatar" is provided (not undefined) before processing it.
     * This ensures we only handle avatar updates when the user actually sends a file/value.
     */
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        avatar:
          avatar !== undefined ? String(avatar).trim() || null : undefined,
        name: name !== undefined ? String(name).trim() : undefined,
        location:
          location !== undefined ? String(location).trim() || null : undefined,
        phone: phone !== undefined ? String(phone).trim() || null : undefined,
        bio: bio !== undefined ? String(bio).trim() || null : undefined,
        skills: normalizedSkills !== undefined ? normalizedSkills : undefined,
      },

      select: PublicUserSelect,
    });
    res.status(200).json({ status: "success", data: { user: updated } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

/**
 * Job preference update endpoint.
 *
 * Handles tab 2 fields: job types, work modes, and salary expectation range.
 */

exports.updatePreferences = async (req, res) => {
  try {
    const {
      preferredJobTypes,
      preferredWorkModes,
      salaryExpectationMin,
      salaryExpectationMax,
    } = req.body;

    if (
      !Array.isArray(preferredJobTypes) ||
      !Array.isArray(preferredWorkModes)
    ) {
      return res
        .status(400)
        .json({ message: "Job types and work modes must be arrays." });
    }

    const invalidJobType = preferredJobTypes.find(
      (item) => !JOB_TYPES.includes(item),
    );

    if (invalidJobType) {
      return res
        .status(400)
        .json({ message: `Unsupported job type: ${invalidJobType}` });
    }
    const invalidWorkMode = preferredWorkModes.find(
      (item) => !WORK_MODES.includes(item),
    );

    if (invalidWorkMode) {
      return res
        .status(400)
        .json({ message: `Unsupported work mode: ${invalidWorkMode}` });
    }

    const min =
      salaryExpectationMin === null || salaryExpectationMin === undefined
        ? null
        : Number(salaryExpectationMin);

    const max =
      salaryExpectationMax === null || salaryExpectationMax === undefined
        ? null
        : Number(salaryExpectationMax);

    if (
      (min !== null && Number.isNaN(min)) ||
      (max !== null && Number.isNaN(max))
    ) {
      return res
        .status(400)
        .json({ message: "Salary expectations must be numeric." });
    }

    if (min !== null && max !== null && min > max) {
      return res
        .status(400)
        .json({ message: "Minimum salary cannot exceed maximum salary" });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        preferredJobTypes,
        preferredWorkModes,
        salaryExpectationMin: min === null ? null : Math.floor(min),
        salaryExpectationMax: max === null ? null : Math.floor(max),
      },
      select: PublicUserSelect,
    });

    res.status(200).json({ status: "success", data: { user: updated } });
  } catch (err) {
    console.error(err);
    console.error(err);
    res.status(500).json({ message: "Failed to update preference" });
  }
};

/**
 * Avatar upload endpoint.
 *
 * Converts a small image file to a data URL and stores it on User.avatar.
 * The UI can render this value directly in <img src="...">, including in the navbar.
 * *****************************************************************************
 * Prefers Cloudinary (short CDN URL in User.avatar). Falls back to a data URL
 * when CLOUDINARY_* env vars are unset — local demo only, not for production.
 */

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Avatar file is required" });
    }

    /**Used for converting images to base 64 which not recommended for database due to its large string */

    // const mime = req.file.mimetype || "image/png";
    // const base64 = req.file.buffer.toString("base64");
    // const dataURL = `data:${mime};base64,${base64}`;

  let avatarUrl

    if (cloudinary.isConfigured()) {
      avatarUrl = await cloudinary.uploadAvatar(req.file.buffer, req.user.id)
    } else {
      console.warn('[avatar] Cloudinary not configured — storing data URL (demo only)')
      const mime = req.file.mimetype || 'image/png'
      const base64 = req.file.buffer.toString('base64')
      avatarUrl = `data:${mime};base64,${base64}`
    }


    const updated = await prisma.user.update({
      where: { id: req.user.id },
      //data: { avatar: dataURL },
      data: { avatar: avatarUrl },
      select: PublicUserSelect,
    });

    res.status(200).json({ status: "success", data: { user: updated } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload avatar" });
  }
};

/**
 * Account deletion endpoint.
 *
 * Removes user-owned tracker entries first, then deletes the user account.
 */

exports.deleteAccount = async (req, res) => {
  try {
    await prisma.savedJob.deleteMany({ where: { userId: req.user.id } });
    await prisma.user.delete({ where: { id: req.user.id } });
    res
      .status(200)
      .json({ status: "success", message: "Account deleted successfuly" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete account" });
  }
};
