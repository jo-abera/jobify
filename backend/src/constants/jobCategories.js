/** Canonical job categories for filters and storage. */

const JOB_CATEGORIES = [
  'Engineering',
  'Sales',
  'Marketing',
  'Finance',
  'Design',
  'Support',
  'Operations',
  'Human Resources',
  'Product',
  'Data',
  'Legal',
  'Other',
];

const DEFAULT_JOB_CATEGORY = 'Other';

function isValidJobCategory(value) {
  return typeof value === 'string' && JOB_CATEGORIES.includes(value);
}

function normalizeJobCategory(value) {
  if (!value || typeof value !== 'string') return DEFAULT_JOB_CATEGORY;
  const trimmed = value.trim();
  return isValidJobCategory(trimmed) ? trimmed : DEFAULT_JOB_CATEGORY;
}

module.exports = {
  JOB_CATEGORIES,
  DEFAULT_JOB_CATEGORY,
  isValidJobCategory,
  normalizeJobCategory,
};