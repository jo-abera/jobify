/**
 * Fix Job.company values that are really description snippets.
 * Uses Telegram channel from job.source when the name is not plausible.
 */
require("dotenv").config({ override: true });
const prisma = require("../src/config/db");
const { resolveJobCompanyName } = require("../src/utils/companyProfile");

function fallbackName(job) {
  return resolveJobCompanyName(job);
}

async function main() {
  const jobs = await prisma.job.findMany({
    select: { id: true, company: true, source: true, description: true },
  });
  let updated = 0;
  for (const job of jobs) {
    const next = fallbackName(job);
    if (!next || next.trim() === String(job.company || "").trim()) continue;
    await prisma.job.update({
      where: { id: job.id },
      data: { company: next },
    });
    updated += 1;
    console.log(`OK ${job.id}: "${job.company?.slice(0, 40)}…" → "${next}"`);
  }
  console.log(`Updated ${updated} job(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());