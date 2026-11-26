const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];

function isValidWorkMode(value) {
  return typeof value === 'string' && WORK_MODES.includes(value);
}

module.exports = { WORK_MODES, isValidWorkMode };