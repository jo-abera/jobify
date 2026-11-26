const { slugifyCompany } = require("./companySlug");
const { collectDisplayLocations } = require("./jobLocation");

const JOB_BOARD_HOSTS = new Set([
  "linkedin.com",
  "www.linkedin.com",
  "indeed.com",
  "www.indeed.com",
  "glassdoor.com",
  "www.glassdoor.com",
  "t.me",
  "telegram.me",
  "www.telegram.me",
  "effoysira.com",
  "reportervacancy.com",
  "forms.gle",
  "docs.google.com",
  "bit.ly",
  "tinyurl.com",
]);

const INVALID_COMPANY_PREFIXES = [
  "description",
  "job description",
  "requirements",
  "requirement",
  "qualifications",
  "qualification",
  "responsibilit",
  "main responsibilit",
  "vacancy",
  "vacancies",
  "position",
  "duties",
  "job title",
  "education",
  "experience",
  "salary",
  "how to apply",
  "install, configure",
];

function humanizeChannelHandle(handle) {
  const base = String(handle || "")
    .replace(/^@/, "")
    .replace(/_/g, " ")
    .trim();
  if (!base) return null;
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeStoredCompanyName(raw) {
  const n = String(raw || "").trim();
  if (/^@[A-Za-z0-9_]+$/.test(n)) return humanizeChannelHandle(n.slice(1)) || n;
  return n;
}

/** Split scraped blobs like "Acme PLCPosition: Accountant" into the employer only. */
function sanitizeCompanyName(name) {
  let n = String(name || "").trim();
  if (!n) return n;
  const posSplit = n.match(/^(.{3,80}?)(?:Position|POSITION)\s*:\s*.+$/);
  if (posSplit) n = posSplit[1].trim();
  const empSplit = n.match(/^(.{3,80}?)\s+Employment\s*:\s*.+$/i);
  if (empSplit) n = empSplit[1].trim();
  return n.replace(/\s{2,}/g, " ").trim();
}

function isTelegramChannelLabel(name, job) {
  const channel = employerFromJobSource(job);
  if (!channel || !name) return false;
  return slugifyCompany(name) === slugifyCompany(channel);
}

/** Reject scraped text that was stored in `Job.company` by mistake. */
function isPlausibleCompanyName(name) {
  const n = sanitizeCompanyName(normalizeStoredCompanyName(name));
  if (n.length < 2 || n.length > 72) return false;
  const lower = n.toLowerCase();
  if (INVALID_COMPANY_PREFIXES.some((p) => lower.startsWith(p))) return false;
  if (/^description\s*:/i.test(n)) return false;
  if (/^[-•●▪]\s/.test(n)) return false;
  if (lower.includes("degree:") || lower.includes("diploma in")) return false;
  if (lower.includes("no experience required")) return false;
  if ((n.match(/:/g) || []).length >= 2) return false;
  if (/\n/.test(n)) return false;
  if (/^https?:\/\//i.test(n)) return false;
  if (/^@[a-z0-9_]+$/.test(n)) return false;
  if (lower === "job") return false;
  if (/\bemployment\s*:/i.test(n) || /#\s*fulltime/i.test(n)) return false;
  return true;
}

function employerFromJobSource(job) {
  const s = String(job?.source || "");
  const m = s.match(/t\.me\/([A-Za-z0-9_]+)/i);
  if (m) return humanizeChannelHandle(m[1]);
  if (s === "manual") return null;
  return null;
}

function extractEmployerFromText(text) {
  const t = String(text || "").trim();
  if (!t) return null;
  const patterns = [
    /(?:^|[:\s])(?:About|ABOUT)\s+([A-Za-z0-9][^.\n:]{2,55}?)(?:\s+(?:PLC|SC|P\.L\.C|Plc)\b|\.|\s+is\s+)/i,
    /(?:Company Description|COMPANY DESCRIPTION)\s+([A-Za-z0-9][^.\n:]{2,55}?)(?:\s+(?:PLC|SC)\b|\.)/i,
    /(?:Organization|Employer|Company\s*Name|Hiring\s+Organization)\s*:\s*([^\n.]{2,55})/i,
    /^([A-Za-z][A-Za-z0-9 &.'-]{2,48}(?:\s+PLC|\s+SC))\b/i,
  ];
  for (const re of patterns) {
    const m = t.match(re);
    const candidate = sanitizeCompanyName(m?.[1]?.trim());
    if (candidate && isPlausibleCompanyName(candidate)) return candidate;
  }
  return null;
}

/**
 * Real employer for company directory / profile (excludes Telegram channel fallbacks).
 */
function resolveEmployerCompanyName(job) {
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

/** Display label for job cards (employer name, else channel, else stored value). */
function resolveJobCompanyName(job) {
  const employer = resolveEmployerCompanyName(job);
  if (employer) return employer;

  const raw = sanitizeCompanyName(normalizeStoredCompanyName(job?.company));
  if (isPlausibleCompanyName(raw)) return raw;
  const fromCompany = extractEmployerFromText(raw);
  if (fromCompany) return fromCompany;
  const fromDescription = extractEmployerFromText(job?.description);
  if (fromDescription) return fromDescription;
  const fromSource = employerFromJobSource(job);
  if (fromSource) return fromSource;
  return null;
}

function isSkippableHost(hostname) {
  const host = String(hostname || "").toLowerCase().replace(/^www\./, "");
  if (JOB_BOARD_HOSTS.has(host) || host.includes("linkedin.com")) return true;
  if (host.includes("telegram") || host === "t.me") return true;
  if (host.endsWith(".effoysira.com") || host.endsWith(".reportervacancy.com")) {
    return true;
  }
  return false;
}

function urlsInText(text) {
  const found = [];
  const re = /https?:\/\/[^\s<>"')]+/gi;
  const src = String(text || "");
  let m;
  while ((m = re.exec(src)) !== null) {
    found.push(m[0].replace(/[.,;:]+$/, ""));
  }
  return found;
}

function addWebsiteCandidate(counts, raw) {
  if (!raw) return;
  try {
    const u = new URL(raw);
    if (isSkippableHost(u.hostname)) return;
    const origin = u.origin;
    counts.set(origin, (counts.get(origin) || 0) + 1);
  } catch {
    /* ignore */
  }
}

function inferWebsiteFromJobs(jobs) {
  const counts = new Map();
  for (const job of jobs) {
    addWebsiteCandidate(counts, job?.url);
    for (const raw of urlsInText(job?.description)) {
      addWebsiteCandidate(counts, raw);
    }
  }
  let best = null;
  let bestCount = 0;
  for (const [origin, count] of counts) {
    if (count > bestCount) {
      best = origin;
      bestCount = count;
    }
  }
  return best;
}

function pickCanonicalName(jobs, { directoryOnly = false } = {}) {
  const resolver = directoryOnly ? resolveEmployerCompanyName : resolveJobCompanyName;
  const counts = new Map();
  for (const job of jobs) {
    const name = resolver(job);
    if (!name) continue;
    counts.set(name, (counts.get(name) || 0) + 1);
  }
  let best = null;
  let bestCount = 0;
  for (const [name, count] of counts) {
    if (count > bestCount) {
      best = name;
      bestCount = count;
    }
  }
  return best || resolver(jobs[0]) || "Employer";
}

function uniqueLocations(jobs) {
  return collectDisplayLocations(jobs);
}

function buildDefaultDescription(jobs, canonicalName) {
  const locations = uniqueLocations(jobs);
  const count = jobs.length;
  const parts = [
    `${canonicalName} has ${count} open ${count === 1 ? "role" : "roles"} on Jobify`,
  ];
  if (locations.length) {
    const shown = locations.slice(0, 4);
    parts.push(
      `Locations include ${shown.join(", ")}${locations.length > 4 ? "…" : ""}`,
    );
  }
  return parts.join(". ") + ".";
}

function withResolvedCompany(job, { directoryOnly = false } = {}) {
  const name = directoryOnly
    ? resolveEmployerCompanyName(job)
    : resolveJobCompanyName(job);
  if (!name) return null;
  return { ...job, company: name };
}

function groupJobsByCompanySlug(jobs, { directoryOnly = false } = {}) {
  const map = new Map();
  for (const job of jobs) {
    const resolved = withResolvedCompany(job, { directoryOnly });
    if (!resolved) continue;
    const slug = slugifyCompany(resolved.company);
    if (!map.has(slug)) map.set(slug, []);
    map.get(slug).push(resolved);
  }
  return map;
}

module.exports = {
  isPlausibleCompanyName,
  normalizeStoredCompanyName,
  sanitizeCompanyName,
  employerFromJobSource,
  resolveEmployerCompanyName,
  resolveJobCompanyName,
  extractEmployerFromText,
  humanizeChannelHandle,
  inferWebsiteFromJobs,
  pickCanonicalName,
  buildDefaultDescription,
  uniqueLocations,
  groupJobsByCompanySlug,
  withResolvedCompany,
};