/**
 * Public job board window: only jobs whose postedAt falls within the last N days.
 */

const LISTING_DAYS = Number(process.env.JOB_LISTING_DAYS) || 7;

function jobListingSince() {
  return new Date(Date.now() - LISTING_DAYS * 24 * 60 * 60 * 1000);
}

function isWithinListingWindow(postedAt) {
  if (!postedAt) return false;
  return new Date(postedAt) >= jobListingSince();
}

function postedAtListingFilter() {
  return { postedAt: { gte: jobListingSince() } };
}

module.exports = {
  LISTING_DAYS,
  jobListingSince,
  isWithinListingWindow,
  postedAtListingFilter,
};
