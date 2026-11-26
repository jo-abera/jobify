const { WORK_MODES } = require('../constants/workModes');

/**
 * Infer Remote / Hybrid / On-site from location + description text.
 */
function inferWorkMode(location = '', description = '') {
  const text = `${location}\n${description}`.toLowerCase();

  if (/\bremote\b|work\s+from\s+home|\bwfh\b|fully\s+remote/.test(text)) {
    return 'Remote';
  }
  if (/\bhybrid\b|partially\s+remote|flexible\s+office/.test(text)) {
    return 'Hybrid';
  }
  return 'On-site';
}

function normalizeWorkMode(value, location = '', description = '') {
  if (typeof value === 'string' && WORK_MODES.includes(value)) return value;
  return inferWorkMode(location, description);
}

module.exports = { inferWorkMode, normalizeWorkMode };