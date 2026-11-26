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
const { PublicUserSelect } = require("../utils/publicUser");
const resumeStorage = require("../utils/resumeStorage");

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

/** Save or replace the user's current resume file (multipart resumeFile). */
exports.uploadCurrent = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    const existing = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { resumeUrl: true },
    });

    if (existing?.resumeUrl) {
      await resumeStorage.removeResumeFile(req.user.id, existing.resumeUrl);
    }

    const resumeUrl = await resumeStorage.saveResumeFile(
      req.file.buffer,
      req.user.id,
      req.file.originalname,
    );

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        resumeUrl,
        resumeFileName: req.file.originalname,
        resumeMimeType: req.file.mimetype,
        resumeUploadedAt: new Date(),
      },
      select: PublicUserSelect,
    });

    res.status(200).json({ status: "success", data: { user: updated } });
  } catch (err) {
    console.error(err);
    const detail =
      process.env.NODE_ENV === "development" && err.message
        ? err.message
        : undefined;
    res.status(500).json({
      message: detail || "Failed to save resume",
      ...(detail && { detail }),
    });
  }
};

function resumeContentType(mimeType, fileName) {
  if (mimeType) return mimeType;
  const lower = String(fileName || "").toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (lower.endsWith(".txt")) return "text/plain";
  return "application/octet-stream";
}

/** Stream the user's current resume (auth). Fixes view/download for Cloudinary raw URLs. */
exports.serveCurrentFile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        resumeUrl: true,
        resumeFileName: true,
        resumeMimeType: true,
      },
    });

    if (!user?.resumeUrl) {
      return res.status(404).json({ message: "No current resume on file" });
    }

    const buffer = await resumeStorage.fetchResumeBuffer(
      user.resumeUrl,
      user.resumeMimeType,
      user.resumeFileName,
    );

    const fileName = user.resumeFileName || "resume";
    const disposition =
      req.query.disposition === "attachment" ? "attachment" : "inline";
    const encodedName = encodeURIComponent(fileName);

    res.setHeader(
      "Content-Type",
      resumeContentType(user.resumeMimeType, fileName),
    );
    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${encodedName}"; filename*=UTF-8''${encodedName}`,
    );
    res.setHeader("Content-Length", String(buffer.length));
    res.send(buffer);
  } catch (err) {
    console.error(err);
    const status = err.statusCode || 500;
    res.status(status).json({
      message: status === 404 ? err.message : "Could not load resume file",
    });
  }
};

/** Remove stored resume metadata and delete the backing file. */
exports.deleteCurrent = async (req, res) => {
  try {
    const existing = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { resumeUrl: true },
    });

    if (existing?.resumeUrl) {
      await resumeStorage.removeResumeFile(req.user.id, existing.resumeUrl);
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        resumeUrl: null,
        resumeFileName: null,
        resumeMimeType: null,
        resumeUploadedAt: null,
      },
      select: PublicUserSelect,
    });

    res.status(200).json({ status: "success", data: { user: updated } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove resume" });
  }
};

/** Score the user's saved resume against a job (no re-upload). */
exports.scoreStored = async (req, res) => {
  try {
    const { jobId } = req.body || {};
    if (!jobId) {
      return res.status(400).json({ message: "jobId is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        resumeUrl: true,
        resumeMimeType: true,
        resumeFileName: true,
      },
    });

    if (!user?.resumeUrl) {
      return res.status(400).json({
        message: "No saved resume. Upload a resume in Profile → Resume first.",
      });
    }

    const buffer = await resumeStorage.fetchResumeBuffer(
      user.resumeUrl,
      user.resumeMimeType,
      user.resumeFileName,
    );

    const resumeText = await extractResumeText(
      buffer,
      user.resumeMimeType,
      user.resumeFileName,
    );
    const result = await scoreResumeForJob(resumeText, jobId);
    res.json(result);
  } catch (err) {
    console.error(err);
    if (err.statusCode === 404 || err.statusCode === 400) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    res.status(500).json({ message: "Failed to score saved resume" });
  }
};
