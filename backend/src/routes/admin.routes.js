/**
 * Admin API routes — /api/admin/*
 *
 * Every route requires JWT (protect) and role admin (restrictTo).
 * Mounted from server.js alongside public job and auth routers.
 */

const express = require("express");
const adminController = require("../controllers/admin.controller");
const protect = require("../middleware/auth.middleware");
const restrictTo = require("../middleware/restrict.middleware");

const router = express.Router();

router.use(protect);
router.use(restrictTo("admin"));

router.get("/stats", adminController.getStats);

router.get("/jobs", adminController.getAllJobs);
router.post("/jobs", adminController.createJob);
router.patch("/jobs/:id", adminController.updateJob);
router.delete("/jobs/:id", adminController.deleteJob);

router.get("/users", adminController.getAllUsers);
router.patch("/users/:id/ban", adminController.banUser);
router.patch("/users/:id/unban", adminController.unbanUser);

router.patch("/users/:id/promote", adminController.promoteUser);
router.delete("/users/:id", adminController.deleteUser);

router.post("/scraper/run", adminController.runScraper);

module.exports = router;
