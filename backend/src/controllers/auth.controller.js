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
