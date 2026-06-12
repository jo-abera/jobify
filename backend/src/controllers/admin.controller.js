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
  } catch (err) {}
};

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


