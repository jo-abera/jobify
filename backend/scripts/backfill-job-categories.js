/**
 * Classify all jobs in the DB by title + description (one-time / maintenance).
 * Usage: node scripts/backfill-job-categories.js
 */
require('dotenv').config({ override: true });

const prisma = require('../src/config/db');
const { inferJobCategory } = require('../src/utils/jobCategoryClassifier');

async function main() {
  const jobs = await prisma.job.findMany({
    select: { id: true, title: true, description: true, category: true },
  });

  const counts = {};
  let updated = 0;

  for (const job of jobs) {
    const next = inferJobCategory({
      title: job.title,
      description: job.description,
    });
    counts[next] = (counts[next] || 0) + 1;
    if (job.category !== next) {
      await prisma.job.update({
        where: { id: job.id },
        data: { category: next },
      });
      updated += 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        total: jobs.length,
        updated,
        byCategory: counts,
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());