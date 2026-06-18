/**
 * Admin-only controller — stats, job/user management, manual scraper trigger.
 *
 * All routes are mounted under /api/admin with protect + restrictTo('admin').
 * Deletes SavedJob rows before Job/User deletes to satisfy foreign keys.
 */

const prisma = require("../config/db");
const { scrapeJobs } = require("../scraper");

/** Build calandar-day buckets for the last 7 days (charts) */

function last7DayRanges() {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    return date;
  });
}

/**
 * Platform analytics for the admin dashboard (stat cards + Chart.js series).
 * Returns counts, status breakdown, daily trends, and top saved jobs.
 */

exports.getStats = async (req, res) => {
  try {
    const totalJobs = await prisma.job.count();
    const totalUsers = await prisma.user.count();
    const totalApplications = await prisma.savedJob.count();
    const bannedUsers = await prisma.user.count({ where: { isBanned: true } });

    const applicationsByStatus = await prisma.savedJob.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const dayRanges = last7DayRanges();

    const jobsPerDay = await Promise.all(
      dayRanges.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        const count = await prisma.job.count({
          where: { postedAt: { gte: date, lt: nextDay } },
        });
        return {
          date: date.toLocaleDateString("en-US", { weekday: "short" }),
          count,
        };
      }),
    );

    const usersPerDay = await Promise.all(
      dayRanges.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        const count = await prisma.user.count({
          where: { createdAt: { gte: date, lt: nextDay } },
        });
        return {
          date: date.toLocaleDateString("en-US", { weekday: "short" }),
          count,
        };
      }),
    );

    const topJobs = await prisma.savedJob.groupBy({
      by: ["jobId"],
      _count: { jobId: true },
      orderBy: { _count: { jobId: "desc" } },
      take: 5,
    });

    const topJobsWithDetails = await Promise.all(
      topJobs.map(async (item) => {
        const job = await prisma.job.findUnique({
          where: { id: item.jobId },
          select: { title: true, company: true },
        });
        return {
          label: job ? `${job.title} @ ${job.company}` : "Unknown",
          count: item._count.jobId,
        };
      }),
    );

    const recentJobs = await prisma.job.count({
      where: {
        postedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    res.json({
      totalJobs,
      totalUsers,
      totalApplications,
      bannedUsers,
      recentJobs,
      applicationsByStatus,
      jobsPerDay,
      usersPerDay,
      topJobs: topJobsWithDetails,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

/** All jobs with save counts -- used on admin Jobs tab */

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { postedAt: "desc" },
      include: { _count: { select: { savedBy: true } } },
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

/** Manual job creation (source defaults to manual) */

exports.createJob = async (req, res) => {
  try {
    const { title, company, location, salary, url, description, type } =
      req.body;
    if (!title || !company || !location || !url || !description) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }
    const job = await prisma.job.create({
      data: {
        title,
        company,
        location,
        salary,
        url,
        description,
        type: type || "Full-time",
        source: "manual",
      },
    });
    res.status(201).json(job);
  } catch (err) {
    if (err.code === "P2002") {
      return res
        .status(400)
        .json({ message: "A job with this URL already exists" });
    }

    res.status(500).json({ message: "Failed to create job" });
  }
};

/** NEEDS TO BE UPDATED DUETO SECURIT ISSUES IN THE CODE */
exports.updateJob = async (req, res) => {
  try {
    const job = await prisma.job.update({
      where: { id: req.params.id },

      /**The "data: req.body" is not good for security please review it */
      data: req.body,
    });

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Failed to update job" });
  }
};

/** Removes tracker row first, then the job record */

exports.deleteJob = async (req, res) => {
  try {
    await prisma.savedJob.deleteMany({ where: { jobId: req.params.id } });
    await prisma.job.delete({ where: { id: req.params.id } });
    res.json({ message: "job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete job" });
  }
};

/** User list with application counts - no passwords exposed  */

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        isVerified: true,
        createdAt: true,
        googleId: true,
        _count: { select: { savedJobs: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "failed to fetch users" });
  }
};

exports.banUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot ban yourself" });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isBanned: true },
    });
    res.json({ message: `User ${user.name} has been banned` });
  } catch (err) {
    res.status(500).json({ message: "Falied to ban user" });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isBanned: false },
    });
    res.json({ message: `User ${user.name} has been unbanned` });
  } catch (err) {
    res.status(500).json({ message: "Failed to unban user" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }
    await prisma.savedJob.deleteMany({ where: { userId: req.params.id } });
    await prisma.user.delete({ where: { id: req.params.id } });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};

exports.promoteUser = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: "admin" },
    });
    res.json({ message: `${user.name} is now an admin` });
  } catch (err) {
    res.status(500).json({ message: "Failed to promote user" });
  }
};

/** Fire-and-forget scraper -- responds immidiatly while scrape runs in background */

exports.runScraper = async (req, res) => {
  try {
    scrapeJobs()
      .then(() => console.log("Manual scrape completed"))
      .catch((err) => console.error("Manual scrape failed:", err.message));

    res.json({
      message: "Scraper started. Check back in a few minutes for new jobs",
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to start scraper" });
  }
};


// exports.runScraper = async (req, res) => {
//   try {
//     await scrapeJobs() // ← wait for everything to finish

//     res.json({ message: "Scraper completed successfully" })
//   } catch (err) {
//     res.status(500).json({ message: "Scraper failed", error: err.message })
//   }
// }