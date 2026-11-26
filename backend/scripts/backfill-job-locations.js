/**
 * Normalize Job.location values polluted by adjacent scraped fields.
 */
require("dotenv").config({ override: true });
const prisma = require("../src/config/db");
const { normalizeJobLocation } = require("../src/utils/jobLocation");

async function main() {
  const jobs = await prisma.job.findMany({
    select: { id: true, location: true },
  });
  let updated = 0;
  for (const job of jobs) {
    const next = normalizeJobLocation(job.location);
    const prev = String(job.location || "").trim();
    if (!next || next === prev) continue;
    await prisma.job.update({
      where: { id: job.id },
      data: { location: next },
    });
    updated += 1;
    if (updated <= 15) {
      console.log(`OK ${job.id}: "${prev.slice(0, 50)}…" → "${next}"`);
    }
  }
  console.log(`Updated ${updated} job location(s).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());