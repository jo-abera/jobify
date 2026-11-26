const prisma = require("../config/db");
const { postedAtListingFilter } = require("../utils/jobListingWindow");
const { slugifyCompany } = require("../utils/companySlug");
const {
  inferWebsiteFromJobs,
  pickCanonicalName,
  buildDefaultDescription,
  uniqueLocations,
  groupJobsByCompanySlug,
  resolveJobCompanyName,
  withResolvedCompany,
} = require("../utils/companyProfile");
const { normalizeJobLocation, pickHeadquarters } = require("../utils/jobLocation");

async function loadActiveJobs() {
  return prisma.job.findMany({
    where: postedAtListingFilter(),
    orderBy: { postedAt: "desc" },
  });
}

function stripJobForList(job) {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    location: normalizeJobLocation(job.location) || job.location,
    salary: job.salary,
    type: job.type,
    category: job.category,
    workMode: job.workMode,
    experienceLevel: job.experienceLevel,
    postedAt: job.postedAt,
    url: job.url,
  };
}

async function findStoredCompany(slug) {
  if (!prisma.company?.findUnique) return null;
  try {
    return await prisma.company.findUnique({ where: { slug } });
  } catch (err) {
    if (err.code === "P2021" || err.code === "P2022") return null;
    throw err;
  }
}

async function findStoredCompanies(slugs) {
  if (!prisma.company?.findMany || slugs.length === 0) return [];
  try {
    return await prisma.company.findMany({ where: { slug: { in: slugs } } });
  } catch (err) {
    if (err.code === "P2021" || err.code === "P2022") return [];
    throw err;
  }
}

async function mergeCompanyProfile(slug, jobs) {
  const canonicalName = pickCanonicalName(jobs, { directoryOnly: true });
  const stored = await findStoredCompany(slug);

  const inferredWebsite = inferWebsiteFromJobs(jobs);
  const website = stored?.website || inferredWebsite;
  const locations = uniqueLocations(jobs);
  const headquarters =
    stored?.headquarters || pickHeadquarters(jobs, locations);
  const description =
    stored?.description?.trim() ||
    buildDefaultDescription(jobs, canonicalName);

  return {
    slug,
    name: stored?.name || canonicalName,
    website,
    description,
    headquarters,
    openJobCount: jobs.length,
    locations,
  };
}

exports.listCompanies = async (_req, res) => {
  try {
    const jobs = await loadActiveJobs();
    const groups = groupJobsByCompanySlug(jobs, { directoryOnly: true });
    const slugs = [...groups.keys()];

    const stored = await findStoredCompanies(slugs);
    const storedBySlug = new Map(stored.map((c) => [c.slug, c]));

    const companies = [...groups.entries()]
      .map(([slug, group]) => {
        const name = storedBySlug.get(slug)?.name || pickCanonicalName(group);
        return {
          slug,
          name,
          openJobCount: group.length,
          website:
            storedBySlug.get(slug)?.website || inferWebsiteFromJobs(group),
        };
      })
      .sort((a, b) => b.openJobCount - a.openJobCount || a.name.localeCompare(b.name));

    res.json({ companies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load companies" });
  }
};

exports.getCompanyBySlug = async (req, res) => {
  try {
    const slug = String(req.params.slug || "").toLowerCase();
    if (!slug) {
      return res.status(400).json({ message: "Invalid company" });
    }

    const jobs = await loadActiveJobs();
    const matched = jobs
      .map((j) => withResolvedCompany(j, { directoryOnly: true }))
      .filter(Boolean)
      .filter((j) => slugifyCompany(j.company) === slug);

    if (matched.length === 0) {
      return res.status(404).json({ message: "Company not found" });
    }

    const company = await mergeCompanyProfile(slug, matched);
    res.json({
      company,
      jobs: matched.map(stripJobForList),
    });
  } catch (err) {
    console.error(err);
    const msg = err.message || "";
    if (msg.includes("company") && msg.includes("does not exist")) {
      return res.status(503).json({
        message:
          "Company profiles are not available yet. Run the Company table SQL migration.",
      });
    }
    res.status(500).json({ message: "Failed to load company" });
  }
};