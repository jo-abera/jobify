const LABEL_PATTERN =
  /^(Job Title|Job Type|Work Location|Salary\/Compensation|Salary|Deadline|Description|Company|Location|Place of Work|Duty Station|Employment Type|Working Hours|Experience Level):\s*(.*)$/i;

const NORMALIZE_PREFIXES = [
  'Job Title:',
  'Job Type:',
  'Work Location:',
  'Salary/Compensation:',
  'Salary:',
  'Deadline:',
  'Description:',
  'Company:',
  'Location:',
  'Place of Work:',
  'Duty Station:',
  'Employment Type:',
  'Working Hours:',
  'Experience Level:',
];

/** Insert line breaks before known labels (matches backend scraper normalization). */
export function normalizeJobDescriptionText(text) {
  if (!text) return '';
  let out = String(text);
  for (const prefix of NORMALIZE_PREFIXES) {
    const re = new RegExp(prefix.replace('/', '\\/'), 'gi');
    out = out.replace(re, `\n${prefix}`);
  }
  return out.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function isNoiseLine(line) {
  if (/^_{2,}$/.test(line)) return true;
  if (/^Private Client/i.test(line)) return true;
  if (/^\d+\s+Jobs?\s+Posted/i.test(line)) return true;
  if (/^(https?:\/\/|@)[^\s]+(\s+(https?:\/\/|@)[^\s]+)*$/i.test(line)) return true;
  return false;
}

function similar(a, b) {
  if (!a || !b) return false;
  const x = a.toLowerCase().trim();
  const y = b.toLowerCase().trim();
  return x === y || x.includes(y) || y.includes(x);
}

function factRedundantWithJob(label, value, job) {
  const key = label.toLowerCase();
  if (key === 'job title' && similar(value, job?.title)) return true;
  if (key === 'company' && similar(value, job?.company)) return true;
  if (
    (key === 'work location' || key === 'location' || key === 'place of work' || key === 'duty station') &&
    similar(value, job?.location)
  ) {
    return true;
  }
  if (key === 'job type' && similar(value, job?.type)) return true;
  if ((key === 'salary' || key === 'salary/compensation') && similar(value, job?.salary)) return true;
  return false;
}

/**
 * @returns {{ facts: { label: string, value: string }[], paragraphs: string[] }}
 */
export function parseJobDescription(raw, job) {
  const normalized = normalizeJobDescriptionText(raw);
  const lines = normalized.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  const facts = [];
  let bodyLines = [];
  let inDescription = false;

  for (const line of lines) {
    if (isNoiseLine(line)) break;

    const match = line.match(LABEL_PATTERN);
    if (match) {
      const value = match[2].trim();
      if (/^description$/i.test(match[1])) {
        inDescription = true;
        if (value) bodyLines.push(value);
        continue;
      }
      inDescription = false;
      if (value) facts.push({ label: match[1], value });
      continue;
    }

    if (inDescription || facts.length > 0) {
      bodyLines.push(line);
    } else {
      bodyLines.push(line);
    }
  }

  const highlightFacts = facts.filter((f) => !factRedundantWithJob(f.label, f.value, job));

  let bodyText = bodyLines
    .join('\n')
    .replace(/[▪️•✅⏹️💧🎈❗️📌🔻★○●■✔♦🎴]/g, '')
    .replace(/__+/g, '')
    .trim();

  if (!bodyText && normalized) {
    bodyText = normalized
      .replace(/[▪️•✅⏹️💧🎈❗️📌🔻★○●■✔♦🎴]/g, '')
      .replace(/__+/g, '')
      .trim();
  }

  const paragraphs = bodyText
    .split(/\n{2,}|\n(?=[A-Z])/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 0 && !isNoiseLine(p));

  return { highlightFacts, paragraphs, normalized };
}

export function formatFactLabel(label) {
  return String(label)
    .split('/')
    .map((part) => part.trim())
    .map((part) => part.replace(/\b[a-z]/g, (c) => c.toUpperCase()))
    .join(' / ');
}