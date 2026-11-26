/** Keep in sync with backend/src/constants/trackerStages.js */

export const TRACKER_STAGES = [
  { id: 'saved', label: 'Saved' },
  { id: 'applied', label: 'Applied' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer' },
  { id: 'rejected', label: 'Rejected' },
];

const LEGACY_STATUS = {
  interviewing: 'interview',
  offered: 'offer',
};

export function normalizeTrackerStatus(value) {
  if (value == null || value === '') return 'saved';
  const lower = String(value).trim().toLowerCase();
  if (LEGACY_STATUS[lower]) return LEGACY_STATUS[lower];
  const known = TRACKER_STAGES.some((s) => s.id === lower);
  return known ? lower : 'saved';
}