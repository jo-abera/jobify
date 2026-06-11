/**
 * Public job board controller — /api/jobs/*
 *
 * Read endpoints power Home and Jobs pages. Write endpoints (create/update/delete)
 * are admin-only and guarded in job.routes with restrictTo('admin').
 */

const prisma = require("../config/db");

exports.getAllJobs = async (req, res) => {
  try {
    const { search, type, location } = req.query;
    const jobs = await prisma.job.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { title: { contains: search } },
                  { company: { contains: search } },
                ],
              }
            : {},
          type ? { type } : {},
          location ? { location: { contains: location } } : {},
        ],
      },
      orderBy: { postedAt: "desc" },
    });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
    });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    console.error(err); // developer log
    res.status(500).json({ message: "Failed to fetch job" });
  }
};

exports.createJob = async (req, res) => {
  try {
    const job = await prisma.job.create({
      data: { ...req.body, source: req.body.source || "manual" },
    });
    res.status(201).json(job);
  } catch (err) {
    if (err.code === "P2002") {
      return res
        .status(400)
        .json({ message: "A job with this URL already exists" });
    }
    console.error(err); // developer log
    res.status(500).json({ message: "Failed to create job" });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await prisma.job.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ message: "Failed to update job" });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    await prisma.savedJob.deleteMany({
      where: { jobId: req.params.id },
    });
    await prisma.job.delete({ where: { id: req.params.id } });
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error(err); // developer log
    res.status(500).json({ message: "Failed to delete job" });
  }
};
