/**
 * Job listing routes — /api/jobs/*
 *
 * Public reads; create/update/delete require admin role (JWT + restrictTo).
 * Register /stats before /:id so "stats" is not captured as an id.
 */

const router = require("express").Router();
const jobController = require("../controllers/job.controller");
const protect = require("../middleware/auth.middleware");
const restrictTo = require("../middleware/restrict.middleware");

router.get("/stats", jobController.getStats);
router.get("/", jobController.getAllJobs);
router.get("/:id:", jobController.getJobById);

router.post("/", protect, restrictTo("admin"), jobController.createJob);
router.patch("/:id", protect, restrictTo("admin"), jobController.updateJob);
router.delete("/:id", protect, restrictTo("admin"), jobController.deleteJob);

module.exports = router;
