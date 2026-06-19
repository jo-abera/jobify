/**
 * Resume scoring routes — /api/resume/*
 *
 * POST /score       — JSON body with pasted resume text
 * POST /score-file  — multipart upload (PDF, DOCX, TXT)
 * Both require auth and delegate to src/ai/resume.js via resume.controller.
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

module.exports = router;
