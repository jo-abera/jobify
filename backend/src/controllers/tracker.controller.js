/**
 * Application tracker controller — /api/tracker/*
 *
 * SavedJob rows link users to jobs and kanban statuses. All queries scope
 * to req.user.id from auth middleware.
 */

const prisma = require("../config/db");

exports.getSavedJobs = async (req, res) => {
  try {
    const saved = await prisma.savedJob.findMany({
      where: { userId: req.user.id },
      include: { job: true },
      orderBy: { savedAt: "desc" },
    });
    res.json(saved);
  } catch (err) {
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
    res.json(saved);
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
    const { status, notes } = req.body;
    const updated = await prisma.savedJob.update({
      where: { id: req.params.id },
      data: { status, notes },
      include: { job: true },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
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
