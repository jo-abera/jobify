/**
 * Infer workMode and experienceLevel for all jobs.
 * Usage: node scripts/backfill-job-work-experience.js
 */
require('dotenv').config({ override: true });

const prisma = require('../src/config/db');
const { normalizeWorkMode } = require('../src/utils/jobWorkMode');
const { normalizeExperienceLevel } = require('../src/utils/jobExperienceLevel');

async function main() {
  const jobs = await prisma.job.findMany({
    select: { id: true, title: true, description: true, location: true, type: true },
  });

  let updated = 0;
  const workCounts = {};
  const expCounts = {};

  for (const job of jobs) {
    const workMode = normalizeWorkMode(null, job.location, job.description);
    const experienceLevel = normalizeExperienceLevel(null, {
      title: job.title,
      description: job.description,
      type: job.type,
    });
    workCounts[workMode] = (workCounts[workMode] || 0) + 1;
    expCounts[experienceLevel] = (expCounts[experienceLevel] || 0) + 1;

    await prisma.job.update({
      where: { id: job.id },
      data: { workMode, experienceLevel },
    });
    updated += 1;
  }

  console.log(JSON.stringify({ total: jobs.length, updated, workCounts, expCounts }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());