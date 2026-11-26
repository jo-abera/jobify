/**
 * Resume scoring routes — /api/resume/*
 *
 * POST /score         — JSON body with pasted resume text
 * POST /score-file    — multipart upload (PDF, DOCX, TXT), scoring only
 * GET /current/file   — stream saved resume (inline or attachment)
 * POST /current       — save or replace the user's profile resume
 * DELETE /current     — remove saved resume
 * POST /score-stored  — score the saved profile resume for a jobId
 * GET  /versions      — upload history
 * GET  /versions/:id/file — stream a historical version
 * POST /versions/:id/current — restore as current resume
 * DELETE /versions/:id — delete one version from history
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

router.get("/current/file", auth, resumeController.serveCurrentFile);
router.post(
  "/current",
  auth,
  handleResumeUpload,
  resumeController.uploadCurrent,
);
router.delete("/current", auth, resumeController.deleteCurrent);
router.post("/score-stored", auth, resumeController.scoreStored);

router.get("/versions", auth, resumeController.listVersions);
router.get("/versions/:id/file", auth, resumeController.serveVersionFile);
router.post("/versions/:id/current", auth, resumeController.setCurrentVersion);
router.delete("/versions/:id", auth, resumeController.deleteVersion);
router.post("/versions/:id/delete", auth, resumeController.deleteVersion);

module.exports = router;
