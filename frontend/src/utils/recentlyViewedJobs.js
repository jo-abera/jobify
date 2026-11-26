const STORAGE_KEY = 'jobify_recently_viewed';
const MAX_ENTRIES = 12;

export const RECENT_VIEWS_CHANGED = 'jobify:recent-views-changed';

function readEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  window.dispatchEvent(new CustomEvent(RECENT_VIEWS_CHANGED));
}

/** Newest-first job ids from this browser. */
export function getRecentlyViewedIds() {
  return readEntries()
    .filter((e) => e && e.id)
    .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt))
    .map((e) => e.id);
}

/** Call when a job detail page loads successfully. */
export function recordJobView(jobId) {
  if (!jobId) return;
  const now = new Date().toISOString();
  const rest = readEntries().filter((e) => e.id !== jobId);
  writeEntries([{ id: jobId, viewedAt: now }, ...rest]);
}

/** Drop ids that no longer exist on the server (expired / deleted). */
export function pruneRecentlyViewedIds(validIds) {
  const valid = new Set(validIds);
  const current = readEntries();
  const kept = current.filter((e) => valid.has(e.id));
  if (kept.length !== current.length) {
    writeEntries(kept);
  }
}

export function clearRecentlyViewed() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(RECENT_VIEWS_CHANGED));
}