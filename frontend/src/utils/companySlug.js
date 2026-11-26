const INVALID_COMPANY_PREFIXES = [
  'description',
  'job description',
  'requirements',
  'qualification',
  'responsibilit',
  'vacancy',
  'position',
];

function humanizeChannelHandle(handle) {
  const base = String(handle || '')
    .replace(/^@/, '')
    .replace(/_/g, ' ')
    .trim();
  if (!base) return null;
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeStoredCompanyName(raw) {
  const n = String(raw || '').trim();
  if (/^@[A-Za-z0-9_]+$/.test(n)) return humanizeChannelHandle(n.slice(1)) || n;
  return n;
}

function sanitizeCompanyName(name) {
  let n = String(name || '').trim();
  if (!n) return n;
  const posSplit = n.match(/^(.{3,80}?)(?:Position|POSITION)\s*:\s*.+$/);
  if (posSplit) n = posSplit[1].trim();
  const empSplit = n.match(/^(.{3,80}?)\s+Employment\s*:\s*.+$/i);
  if (empSplit) n = empSplit[1].trim();
  return n.replace(/\s{2,}/g, ' ').trim();
}

function employerFromJobSource(job) {
  const s = String(job?.source || '');
  const m = s.match(/t\.me\/([A-Za-z0-9_]+)/i);
  if (!m) return null;
  return humanizeChannelHandle(m[1]);
}

function isTelegramChannelLabel(name, job) {
  const channel = employerFromJobSource(job);
  if (!channel || !name) return false;
  return slugifyCompany(name) === slugifyCompany(channel);
}

export function isPlausibleCompanyName(name) {
  const n = sanitizeCompanyName(normalizeStoredCompanyName(name));
  if (n.length < 2 || n.length > 72) return false;
  const lower = n.toLowerCase();
  if (INVALID_COMPANY_PREFIXES.some((p) => lower.startsWith(p))) return false;
  if (/^description\s*:/i.test(n)) return false;
  if (lower.includes('degree:') || lower.includes('diploma in')) return false;
  if ((n.match(/:/g) || []).length >= 2) return false;
  if (/^@[a-z0-9_]+$/.test(n)) return false;
  if (lower === 'job') return false;
  if (/\bemployment\s*:/i.test(n) || /#\s*fulltime/i.test(n)) return false;
  return true;
}

function extractEmployerFromText(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  const patterns = [
    /(?:^|[:\s])(?:About|ABOUT)\s+([A-Za-z0-9][^.\n:]{2,55}?)(?:\s+(?:PLC|SC|P\.L\.C|Plc)\b|\.|\s+is\s+)/i,
    /(?:Organization|Employer|Company\s*Name)\s*:\s*([^\n.]{2,55})/i,
    /^([A-Za-z][A-Za-z0-9 &.'-]{2,48}(?:\s+PLC|\s+SC))\b/i,
  ];
  for (const re of patterns) {
    const m = t.match(re);
    const candidate = sanitizeCompanyName(m?.[1]?.trim());
    if (candidate && isPlausibleCompanyName(candidate)) return candidate;
  }
  return null;
}

/** Named employer suitable for a company profile page (not a Telegram repost channel). */
export function resolveEmployerCompanyName(job) {
  const raw = sanitizeCompanyName(normalizeStoredCompanyName(job?.company));
  const fromDesc = extractEmployerFromText(job?.description);
  const fromTitle = extractEmployerFromText(job?.title);
  const extracted = fromDesc || fromTitle;
  if (extracted) return extracted;

  if (isPlausibleCompanyName(raw) && !isTelegramChannelLabel(raw, job)) {
    return raw;
  }
  return null;
}

export function resolveCompanyDisplayName(job) {
  const employer = resolveEmployerCompanyName(job);
  if (employer) return employer;

  const raw = sanitizeCompanyName(normalizeStoredCompanyName(job?.company));
  if (isPlausibleCompanyName(raw)) return raw;
  const fromSource = employerFromJobSource(job);
  if (fromSource) return fromSource;
  return raw || 'Employer';
}

/** Keep Unicode letters so Amharic employers do not all map to the same slug. */
export function slugifyCompany(name) {
  const raw = String(name || '').trim();
  const base = raw
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
  if (base) return base;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return `org-${hash.toString(16).padStart(8, '0')}`;
}

export function companyPathForName(name) {
  return `/companies/${slugifyCompany(name)}`;
}

export function companyPathForJob(job) {
  const employer = resolveEmployerCompanyName(job);
  if (!employer) return null;
  return companyPathForName(employer);
}

export function jobHasCompanyPage(job) {
  return Boolean(resolveEmployerCompanyName(job));
}