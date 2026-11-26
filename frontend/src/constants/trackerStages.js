/** Keep in sync with backend/src/constants/trackerStages.js */

export const TRACKER_STAGES = [
  { id: 'saved', label: 'Saved', dotClass: 'bg-slate-400' },
  { id: 'applied', label: 'Applied', dotClass: 'bg-blue-primary' },
  { id: 'interview', label: 'Interview', dotClass: 'bg-violet-500' },
  { id: 'offer', label: 'Offer', dotClass: 'bg-emerald-500' },
  { id: 'rejected', label: 'Rejected', dotClass: 'bg-red-400' },
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