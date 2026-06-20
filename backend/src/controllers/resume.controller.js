/**
 * Resume scoring controller.
 *
 * Supports pasted text (POST /score) and file upload (POST /score-file).
 * Loads job.description from Prisma, then delegates to src/ai/resume.js.
 */

/**
 * Shared scoring path — validates job exists and calls OpenAI matcher.
 * @param {string} resumeText - Plain-text resume content
 * @param {string} jobId - Job.id from the client
 */

const prisma = require("../config/db");
const { scoreResume } = require("../ai/resume");
const { extractResumeText } = require("../utils/resumeParser");

async function scoreResumeForJob(resumeText, jobId) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    const err = new Error("Job not found");
    err.statusCode = 404;
    throw err;
  }
  return scoreResume(resumeText, job.description);
}

/** Score resume text from JSON body { resume, jobId }. */

exports.score = async (req, res) => {
  try {
    const { resume, jobId } = req.body || {};
    if (!resume?.trim() || !jobId) {
      return res.status(400).json({ message: "Resume and jobId are required" });
    }
    const result = await scoreResumeForJob(resume.trim(), jobId);
    res.json(result);
  } catch (err) {
    console.error(err);
    if (
      err.code === "insufficient_quota" ||
      err.status === 429 ||
      err?.error?.code === "insufficient_quota"
    ) {
      return res.status(429).json({
        message:
          "Ai quota exceeded or rate limit reached. Please check your API plan and try again later.",
      });
    }
    const status = err.statusCode || 500;
    res.status(status).json({
      message: status === 404 ? err.message : "Failed to score resume",
    });
  }
};

/**
 * Score resume from uploaded file (multipart field resumeFile + jobId).
 * Text is extracted server-side before the same OpenAI flow as score().
 */

exports.scoreFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ message: "jobId is required" });
    }
    const resumeText = await extractResumeText(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname,
    );
    const result = await scoreResumeForJob(resumeText, jobId);
    res.json(result);
  } catch (err) {
    console.error(err);
    if (err.statusCode === 404) {
      return res.status(404).json({ message: err.message });
    }
    if (
      err.message?.includes("extract") ||
      err.message?.includes("supported") ||
      err.message?.includes("allowed")
    ) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Failed to score resume" });
  }
};
