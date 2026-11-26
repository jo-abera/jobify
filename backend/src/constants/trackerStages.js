/** Kanban pipeline stages for SavedJob.status */

const TRACKER_STAGES = [
  { id: 'saved', label: 'Saved' },
  { id: 'applied', label: 'Applied' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer' },
  { id: 'rejected', label: 'Rejected' },
];

const TRACKER_STAGE_IDS = TRACKER_STAGES.map((s) => s.id);

const LEGACY_STATUS = {
  interviewing: 'interview',
  offered: 'offer',
};

function normalizeTrackerStatus(value) {
  if (value == null || value === '') return 'saved';
  const lower = String(value).trim().toLowerCase();
  if (LEGACY_STATUS[lower]) return LEGACY_STATUS[lower];
  if (TRACKER_STAGE_IDS.includes(lower)) return lower;
  return null;
}

function isValidTrackerStatus(value) {
  return normalizeTrackerStatus(value) !== null;
}

module.exports = {
  TRACKER_STAGES,
  TRACKER_STAGE_IDS,
  normalizeTrackerStatus,
  isValidTrackerStatus,
};