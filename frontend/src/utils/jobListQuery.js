/** Query keys synced between /jobs URL and GET /api/jobs */

export const JOB_FILTER_PARAM_KEYS = [
  'search',
  'category',
  'workMode',
  'experienceLevel',
  'postedWithin',
  'sourceSite',
  'type',
];

export function apiParamsFromSearchParams(
  searchParams,
  { page, limit, omitCategory = false } = {}
) {
  const params = {};
  if (page != null) params.page = page;
  if (limit != null) params.limit = limit;

  for (const key of JOB_FILTER_PARAM_KEYS) {
    if (omitCategory && key === 'category') continue;
    const value = searchParams.get(key);
    if (value) params[key] = value;
  }
  return params;
}

export function setFilterParam(searchParams, key, value) {
  const next = new URLSearchParams(searchParams);
  if (value) next.set(key, value);
  else next.delete(key);
  return next;
}

export function clearFilterParams(searchParams, except = ['search']) {
  const next = new URLSearchParams();
  for (const key of except) {
    const value = searchParams.get(key);
    if (value) next.set(key, value);
  }
  return next;
}