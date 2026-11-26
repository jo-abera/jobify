const { EXPERIENCE_LEVELS } = require('../constants/experienceLevels');

function inferExperienceLevel({ sourceLabel = '', title = '', description = '', type = '' } = {}) {
  const text = `${sourceLabel}\n${title}\n${description}\n${type}`.toLowerCase();

  if (/\binternship\b|\bintern\b/.test(text)) return 'Internship';
  if (/entry\s*level|fresh\s+graduate|graduate|0-1\s+years?|no\s+experience/.test(text)) {
    return 'Entry Level';
  }
  if (/\bjunior\b|\bassociate\b(?!\s+degree)|1-2\s+years?|2\s+years?/.test(text)) {
    return 'Junior';
  }
  if (/mid\s*level|intermediate|3-5\s+years?|4\s+years?|5\s+years?/.test(text)) {
    return 'Mid Level';
  }
  if (/\bsenior\b|sr\.|5\+\s*years?|6\+?\s*years?|7\+?\s*years?/.test(text)) {
    return 'Senior';
  }
  if (/\blead\b|principal|staff\s+engineer|head\s+of/.test(text)) {
    return 'Lead';
  }
  if (/\bexecutive\b|\bceo\b|\bcfo\b|\bdirector\b|\bvp\b|vice\s+president/.test(text)) {
    return 'Executive';
  }

  if (sourceLabel.trim()) {
    const normalized = normalizeExperienceLabel(sourceLabel);
    if (normalized) return normalized;
  }

  return 'Not specified';
}

function normalizeExperienceLabel(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const label = raw.trim().toLowerCase();

  const map = {
    internship: 'Internship',
    intern: 'Internship',
    'entry level': 'Entry Level',
    entry: 'Entry Level',
    fresher: 'Entry Level',
    junior: 'Junior',
    'mid level': 'Mid Level',
    mid: 'Mid Level',
    intermediate: 'Mid Level',
    senior: 'Senior',
    lead: 'Lead',
    principal: 'Lead',
    executive: 'Executive',
    director: 'Executive',
  };

  for (const [key, value] of Object.entries(map)) {
    if (label.includes(key)) return value;
  }

  return null;
}

function normalizeExperienceLevel(value, ctx = {}) {
  if (typeof value === 'string' && EXPERIENCE_LEVELS.includes(value)) return value;
  return inferExperienceLevel({
    sourceLabel: value || '',
    ...ctx,
  });
}

module.exports = {
  inferExperienceLevel,
  normalizeExperienceLevel,
  normalizeExperienceLabel,
};