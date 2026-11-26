/**
 * Resume scoring routes — /api/resume/*
 *
 * POST /score         — JSON body with pasted resume text
 * POST /score-file    — multipart upload (PDF, DOCX, TXT), scoring only
 * POST /current       — save or replace the user's profile resume
 * DELETE /current     — remove saved resume
 * POST /score-stored  — score the saved profile resume for a jobId
 */

const router = require("express").Router();
const resumeController = require("../controllers/resume.controller");
const auth = require("../middleware/auth.middleware");
const { handleResumeUpload } = require("../middleware/upload.middleware");

router.post("/score", auth, resumeController.score);
router.post(
  "/score-file",
  auth,
  handleResumeUpload,
  resumeController.scoreFile,
);

router.post(
  "/current",
  auth,
  handleResumeUpload,
  resumeController.uploadCurrent,
);
router.delete("/current", auth, resumeController.deleteCurrent);
router.post("/score-stored", auth, resumeController.scoreStored);

module.exports = router;
