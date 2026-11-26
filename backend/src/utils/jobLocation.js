const JUNK_MARKERS = [
  /Applicants(?:\s+Needed|\s+Requirement)/i,
  /Deadline(?:\s+Date)?/i,
  /Job\s+Summary/i,
  /Salary(?:\/Compensation)?/i,
  /Education/i,
  /Experience\s+Level/i,
  /How\s+to\s+Apply/i,
  /Job\s+Type/i,
  /Working\s+Hours/i,
];

/** Trim scraped location strings that ran into the next job-post field. */
function normalizeJobLocation(raw) {
  let s = String(raw || "").trim();
  if (!s) return "";
  let cutAt = -1;
  for (const re of JUNK_MARKERS) {
    const m = re.exec(s);
    if (m && m.index > 0 && (cutAt < 0 || m.index < cutAt)) cutAt = m.index;
  }
  if (cutAt > 0) s = s.slice(0, cutAt).trim();
  s = s.replace(/,\s*EthiopiaApplicants/i, ", Ethiopia").trim();
  s = s.replace(/[.,;:]+$/g, "").replace(/\s+/g, " ").trim();
  if (s.length > 72) {
    const short = s.match(/^[^.]{3,72}/);
    s = (short ? short[0] : s.slice(0, 72)).trim();
  }
  return s;
}

function locationKey(loc) {
  return loc.toLowerCase().replace(/\s+/g, " ").trim();
}

function isVagueLocation(loc) {
  return /^others(\s*,\s*ethiopia)?$/i.test(String(loc || "").trim());
}

function collectDisplayLocations(jobs) {
  const byKey = new Map();
  for (const job of jobs) {
    const loc = normalizeJobLocation(job.location);
    if (!loc || isVagueLocation(loc)) continue;
    const key = locationKey(loc);
    if (!byKey.has(key)) byKey.set(key, loc);
  }
  if (byKey.size > 0) {
    return [...byKey.values()].sort((a, b) => a.localeCompare(b));
  }
  return ["Various locations, Ethiopia"];
}

function pickHeadquarters(jobs, locations) {
  if (!locations?.length) return null;
  const addis = locations.find((l) => /addis\s+ababa/i.test(l));
  if (addis) return addis;
  for (const job of jobs) {
    const loc = normalizeJobLocation(job.location);
    if (loc && !isVagueLocation(loc)) return loc;
  }
  return locations[0];
}

module.exports = {
  normalizeJobLocation,
  collectDisplayLocations,
  pickHeadquarters,
  isVagueLocation,
};