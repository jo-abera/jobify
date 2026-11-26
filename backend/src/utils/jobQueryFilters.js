const { isValidJobCategory } = require('../constants/jobCategories');
const { isValidWorkMode } = require('../constants/workModes');
const { isValidExperienceLevel } = require('../constants/experienceLevels');
const { isValidSourceSite } = require('../constants/jobSources');
const { LISTING_DAYS } = require('./jobListingWindow');

const MAX_POSTED_WITHIN_DAYS = 30;

function postedSinceDate(days) {
  const n = Math.min(Math.max(1, Number(days) || LISTING_DAYS), MAX_POSTED_WITHIN_DAYS);
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function postedWithinClause(postedWithin) {
  if (postedWithin === undefined || postedWithin === null || postedWithin === '') {
    return { postedAt: { gte: postedSinceDate(LISTING_DAYS) } };
  }
  return { postedAt: { gte: postedSinceDate(postedWithin) } };
}

function sourceSiteClause(sourceSite) {
  if (!sourceSite || !isValidSourceSite(sourceSite)) return null;

  const v = String(sourceSite).toLowerCase();
  if (v === 'manual') return { source: 'manual' };
  if (v === 'telegram') {
    return { source: { contains: 't.me', mode: 'insensitive' } };
  }
  return { source: { contains: v, mode: 'insensitive' } };
}

/**
 * Build Prisma `where.AND` fragments from public list query params.
 */
function buildJobListFilters(query) {
  const {
    search,
    type,
    location,
    category,
    workMode,
    experienceLevel,
    postedWithin,
    sourceSite,
  } = query;

  const and = [];

  if (search) {
    and.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  if (type) and.push({ type });
  if (category && isValidJobCategory(category)) and.push({ category });

  if (workMode && isValidWorkMode(workMode)) {
    and.push({ workMode });
  } else if (location) {
    const loc = String(location).toLowerCase();
    if (loc.includes('remote')) and.push({ workMode: 'Remote' });
    else {
      and.push({ location: { contains: location, mode: 'insensitive' } });
    }
  }
  if (experienceLevel && isValidExperienceLevel(experienceLevel)) {
    and.push({ experienceLevel });
  }

  const sourceClause = sourceSiteClause(sourceSite);
  if (sourceClause) and.push(sourceClause);

  and.push(postedWithinClause(postedWithin));

  return { AND: and };
}

module.exports = {
  buildJobListFilters,
  postedSinceDate,
  MAX_POSTED_WITHIN_DAYS,
};