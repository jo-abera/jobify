/**
 * Deletes jobs from the database when they are older than the listing window (default 7 days).
 * Any saved bookmarks for those jobs are removed automatically (cascade delete).
 */

const prisma = require("../config/db");
const { jobListingSince, LISTING_DAYS } = require("../utils/jobListingWindow");

async function removeOldJobs() {
  const oldestAllowedDate = jobListingSince();
  const { count } = await prisma.job.deleteMany({
    where: { postedAt: { lt: oldestAllowedDate } },
  });

  if (count > 0) {
    console.log(
      `[jobs] Removed ${count} old job(s) (older than ${LISTING_DAYS} days)`,
    );
  }

  return count;
}

module.exports = { removeOldJobs };
