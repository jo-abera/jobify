/**
 * Public job board controller — /api/jobs/*
 *
 * Read endpoints power Home and Jobs pages. Write endpoints (create/update/delete)
 * are admin-only and guarded in job.routes with restrictTo('admin').
 */

const prisma = require("../config/db");
const { isWithinListingWindow } = require("../utils/jobListingWindow");
const {
  isValidJobCategory,
  normalizeJobCategory,
} = require("../constants/jobCategories");
const { inferJobCategory } = require("../utils/jobCategoryClassifier");
const { normalizeWorkMode } = require("../utils/jobWorkMode");
const { normalizeExperienceLevel } = require("../utils/jobExperienceLevel");
const {
  buildJobListFilters,
  MAX_POSTED_WITHIN_DAYS,
} = require("../utils/jobQueryFilters");
const { SOURCE_SITE_OPTIONS } = require("../constants/jobSources");
const { WORK_MODES } = require("../constants/workModes");
const { EXPERIENCE_LEVELS } = require("../constants/experienceLevels");
const { JOB_CATEGORIES } = require("../constants/jobCategories");

// exports.getAllJobs = async (req, res) => {
//   try {
//     const { search, type, location } = req.query;
//     const jobs = await prisma.job.findMany({
//       where: {
//         AND: [
//           search
//             ? {
//                 OR: [
//                   { title: { contains: search } },
//                   { company: { contains: search } },
//                 ],
//               }
//             : {},
//           type ? { type } : {},
//           location ? { location: { contains: location } } : {},
//         ],
//       },
//       orderBy: { postedAt: "desc" },
//     });
//     res.json(jobs);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch jobs" });
//   }
// };

exports.getFilterOptions = async (_req, res) => {
  try {
    res.json({
      categories: JOB_CATEGORIES,
      workModes: WORK_MODES,
      experienceLevels: EXPERIENCE_LEVELS,
      sourceSites: SOURCE_SITE_OPTIONS,
      postedWithinDays: [1, 3, 7, 14, 30].filter((d) => d <= MAX_POSTED_WITHIN_DAYS),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load filter options" });
  }
};

/** Job counts per category; respects current filters except `category`. */
exports.getCategoryCounts = async (req, res) => {
  try {
    const query = { ...req.query };
    delete query.category;
    delete query.page;
    delete query.limit;

    const where = buildJobListFilters(query);

    const grouped = await prisma.job.groupBy({
      by: ["category"],
      where,
      _count: { _all: true },
    });

    const byCategory = Object.fromEntries(
      JOB_CATEGORIES.map((name) => [name, 0])
    );
    let total = 0;

    for (const row of grouped) {
      const count = row._count._all;
      if (byCategory[row.category] !== undefined) {
        byCategory[row.category] = count;
      } else {
        byCategory.Other = (byCategory.Other || 0) + count;
      }
      total += count;
    }

    res.json({ total, byCategory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load category counts" });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = buildJobListFilters(req.query);

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { postedAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.job.count({ where }),
    ]);

    res.json({
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1,
      },
    });
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
    if (!isWithinListingWindow(job.postedAt)) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (err) {
    console.error(err); // developer log
    res.status(500).json({ message: "Failed to fetch job" });
  }
};

exports.createJob = async (req, res) => {
  try {
    const category =
      req.body.category && isValidJobCategory(req.body.category)
        ? normalizeJobCategory(req.body.category)
        : inferJobCategory({
            title: req.body.title,
            description: req.body.description,
          });
    const workMode = normalizeWorkMode(
      req.body.workMode,
      req.body.location,
      req.body.description
    );
    const experienceLevel = normalizeExperienceLevel(req.body.experienceLevel, {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
    });
    const job = await prisma.job.create({
      data: {
        ...req.body,
        category,
        workMode,
        experienceLevel,
        source: req.body.source || "manual",
      },
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
    const data = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(req.body, "category")) {
      data.category = normalizeJobCategory(req.body.category);
    }
    const job = await prisma.job.update({
      where: { id: req.params.id },
      data,
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

/** Public aggregate stats for the marketing Home page. */

exports.getStats = async (req, res) => {
  try {
    const listingWhere = postedAtListingFilter();
    const [totalJobs, companies] = await Promise.all([
      prisma.job.count({ where: listingWhere }),
      prisma.job.findMany({
        where: listingWhere,
        select: { company: true },
        distinct: ["company"],
      }),
    ]);
    const userCount = await prisma.user.count();
    res.json({
      totalJobs,
      companiesTracked: companies.length,
      jobSeekers: userCount,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};
