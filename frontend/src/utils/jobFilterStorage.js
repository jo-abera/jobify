import { JOB_FILTER_PARAM_KEYS } from './jobListQuery';

const STORAGE_KEY = 'jobify.jobFilters.v1';

export function hasActiveFilterParams(searchParams) {
  return JOB_FILTER_PARAM_KEYS.some((key) => Boolean(searchParams.get(key)));
}

/** @returns {Record<string, string> | null} */
export function readStoredJobFilters() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const out = {};
    for (const key of JOB_FILTER_PARAM_KEYS) {
      const value = parsed[key];
      if (value != null && String(value).trim() !== '') {
        out[key] = String(value);
      }
    }
    return out;
  } catch {
    return null;
  }
}

export function writeStoredJobFilters(searchParams) {
  const obj = {};
  for (const key of JOB_FILTER_PARAM_KEYS) {
    const value = searchParams.get(key);
    if (value) obj[key] = value;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {
    /* quota / private mode */
  }
}

export function searchParamsFromStored(stored) {
  const next = new URLSearchParams();
  if (!stored) return next;
  for (const key of JOB_FILTER_PARAM_KEYS) {
    const value = stored[key];
    if (value) next.set(key, value);
  }
  return next;
}