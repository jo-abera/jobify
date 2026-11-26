/**
 * Application tracker controller — /api/tracker/*
 *
 * SavedJob rows link users to jobs and kanban statuses. All queries scope
 * to req.user.id from auth middleware.
 */

const prisma = require("../config/db");
const {
  normalizeTrackerStatus,
  isValidTrackerStatus,
} = require("../constants/trackerStages");
const {
  readAppliedAt,
  writeAppliedAt,
  appliedAtMapForUser,
  attachAppliedAt,
} = require("../utils/trackerAppliedAt");

async function respondWithSavedJob(res, savedJobId, userId) {
  const row = await prisma.savedJob.findFirst({
    where: { id: savedJobId, userId },
    include: { job: true },
  });
  if (!row) return res.status(404).json({ message: "Not found" });
  const appliedAt = await readAppliedAt(prisma, savedJobId, userId);
  res.json({ ...row, appliedAt });
}

exports.getSavedJobs = async (req, res) => {
  try {
    const saved = await prisma.savedJob.findMany({
      where: { userId: req.user.id },
      include: { job: true },
      orderBy: { savedAt: "desc" },
    });
    const map = await appliedAtMapForUser(prisma, req.user.id);
    res.json(attachAppliedAt(saved, map));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch saved jobs" });
  }
};

exports.saveJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const existing = await prisma.savedJob.findFirst({
      where: { userId: req.user.id, jobId },
    });
    if (existing) return res.status(400).json({ message: "Job already saved" });
    const saved = await prisma.savedJob.create({
      data: { userId: req.user.id, jobId },
      include: { job: true },
    });
    res.json({ ...saved, appliedAt: null });
  } catch (err) {
    res.status(500).json({ message: "Failed to save Job" });
  }
};

/** Updates kanban status and optional notes; :id is SavedJob.id. */

exports.updateStatus = async (req, res) => {
  try {
    const saved = await prisma.savedJob.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!saved) return res.status(404).json({ message: "Not found" });

    const { status, notes, appliedAt } = req.body;
    let data = {};
    let appliedAtUpdate;
    let nextStatus = saved.status;

    if (status !== undefined) {
      if (!isValidTrackerStatus(status)) {
        return res.status(400).json({ message: "Invalid tracker stage" });
      }
      nextStatus = normalizeTrackerStatus(status);
      data.status = nextStatus;
    }

    if (appliedAt !== undefined) {
      if (appliedAt === null || appliedAt === "") {
        appliedAtUpdate = null;
      } else {
        const parsed = new Date(appliedAt);
        if (Number.isNaN(parsed.getTime())) {
          return res.status(400).json({ message: "Invalid application date" });
        }
        appliedAtUpdate = parsed;
      }
    } else if (
      status !== undefined &&
      nextStatus === "applied"
    ) {
      const currentAppliedAt = await readAppliedAt(
        prisma,
        req.params.id,
        req.user.id
      );
      if (!currentAppliedAt) {
        appliedAtUpdate = new Date();
      }
    }

    if (notes !== undefined) {
      const trimmed = typeof notes === "string" ? notes.trim() : "";
      data.notes = trimmed ? trimmed.slice(0, 2000) : null;
    }

    if (Object.keys(data).length === 0 && appliedAtUpdate === undefined) {
      return res.status(400).json({ message: "No updates provided" });
    }

    if (appliedAtUpdate !== undefined) {
      await writeAppliedAt(
        prisma,
        req.params.id,
        req.user.id,
        appliedAtUpdate
      );
    }

    if (Object.keys(data).length > 0) {
      await prisma.savedJob.update({
        where: { id: req.params.id },
        data,
      });
    }

    return respondWithSavedJob(res, req.params.id, req.user.id);
  } catch (err) {
    console.error(err);
    const detail =
      process.env.NODE_ENV === "development" ? err.message : undefined;
    res.status(500).json({
      message: "Failed to update application",
      ...(detail && { detail }),
    });
  }
};

exports.removeJob = async (req, res) => {
  try {
    const saved = await prisma.savedJob.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!saved) return res.status(404).json({ message: "Not found" });
    await prisma.savedJob.delete({ where: { id: req.params.id } });
    res.json({ message: "Removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove job" });
  }
};