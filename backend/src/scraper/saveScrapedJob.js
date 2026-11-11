/**
 * Save or update a scraped job without creating Josad-style duplicates.
 */

const prisma = require("../config/db");
const {
  normalizeJobUrl,
  pickStoredUrl,
  preferJobUrl,
} = require("../utils/avoidDuplicateJobs");

const jobFields = (parsed, postedAt) => ({
  title: parsed.title,
  company: parsed.company,
  location: parsed.location,
  salary: parsed.salary,
  type: parsed.type,
  description: parsed.description,
  source: parsed.source,
  postedAt,
});

async function findExistingJob(parsed, storedUrl) {
  const urls = new Set();
  for (const raw of [storedUrl, parsed.applyLink, parsed.messageUrl]) {
    const n = normalizeJobUrl(raw);
    if (n) urls.add(n);
  }

  for (const url of urls) {
    const byUrl = await prisma.job.findUnique({ where: { url } });
    if (byUrl) return byUrl;
  }

  return prisma.job.findFirst({
    where: {
      title: { equals: parsed.title, mode: "insensitive" },
      company: { equals: parsed.company, mode: "insensitive" },
    },
  });
}

async function saveScrapedJob(parsed, postedAt) {
  const storedUrl = pickStoredUrl(parsed.applyLink, parsed.messageUrl);
  if (!storedUrl) return false;

  const data = jobFields(parsed, postedAt);
  const existing = await findExistingJob(parsed, storedUrl);

  if (existing) {
    const url = preferJobUrl(existing.url, storedUrl);
    try {
      await prisma.job.update({
        where: { id: existing.id },
        data: { ...data, url },
      });
    } catch (err) {
      if (err.code === "P2002") {
        await prisma.job.update({
          where: { id: existing.id },
          data,
        });
      } else {
        throw err;
      }
    }
    return true;
  }

  await prisma.job.create({
    data: { ...data, url: storedUrl },
  });
  return true;
}

module.exports = { saveScrapedJob };
