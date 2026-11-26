const EXPERIENCE_LEVELS = [
  'Internship',
  'Entry Level',
  'Junior',
  'Mid Level',
  'Senior',
  'Lead',
  'Executive',
  'Not specified',
];

function isValidExperienceLevel(value) {
  return typeof value === 'string' && EXPERIENCE_LEVELS.includes(value);
}

module.exports = { EXPERIENCE_LEVELS, isValidExperienceLevel };