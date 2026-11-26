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

/** Remove job-board channel footers and “view details” stubs from scraped blobs. */
export function stripListingFooter(text) {
  let s = String(text || '').trim();
  if (!s) return '';

  const cutPatterns = [
    /\[\s*view details below\s*\]/i,
    /Verified\s+Company/i,
    /\d+\s+Jobs?\s+Posted/i,
    /\bFrom:\s*/i,
    /\|\s*@[a-z0-9_]+/i,
  ];
  let cutAt = s.length;
  for (const re of cutPatterns) {
    const m = re.exec(s);
    if (m && m.index >= 0 && m.index < cutAt) cutAt = m.index;
  }
  s = s.slice(0, cutAt).trim();

  s = s.replace(/\s*\.{2,}\s*$/g, '').trim();
  s = s.replace(/\s+\w{1,4}\s*\.{2,}$/g, '').trim();
  return s;
}

/** Turn inline “.* item” Telegram bullets into line-based bullets. */
export function expandAsteriskBullets(text) {
  let s = String(text || '').trim();
  if (!s) return s;
  if (!/\.\*\s|\s\*\s+|^\*\s/m.test(s)) return s;

  s = s.replace(/^\s*(?:work|duties|responsibilities)\s*[:.]?\s*/i, '');
  s = s.replace(/\.\*\s*/g, '.\n- ');
  s = s.replace(/;\*\s*/g, ';\n- ');
  s = s.replace(/^\*\s*/, '- ');
  s = s.replace(/\s+\*\s+/g, '\n- ');
  return s.trim();
}

function isNoiseLine(line) {
  if (/^_{2,}$/.test(line)) return true;
  if (/^Private Client/i.test(line)) return true;
  if (/^\d+\s+Jobs?\s+Posted/i.test(line)) return true;
  if (/Verified\s+Company/i.test(line)) return true;
  if (/^\[view details below\]/i.test(line)) return true;
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

function splitBulletsAndParagraphs(bodyText) {
  const bullets = [];
  const paragraphs = [];
  const lines = bodyText.split(/\n/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    const bullet = line.match(/^(?:[•\-–]|\*)\s+(.+)$/);
    if (bullet) {
      const item = bullet[1].replace(/\s+/g, ' ').trim();
      if (item.length > 2) bullets.push(item);
      continue;
    }
    const cleaned = line.replace(/\s+/g, ' ').trim();
    if (cleaned.length > 0 && !isNoiseLine(cleaned)) paragraphs.push(cleaned);
  }
  return { bullets, paragraphs };
}

/**
 * @returns {{ highlightFacts: object[], paragraphs: string[], bullets: string[] }}
 */
export function parseJobDescription(raw, job) {
  const stripped = stripListingFooter(raw);
  const withBullets = expandAsteriskBullets(stripped);
  const normalized = normalizeJobDescriptionText(withBullets);
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

  const stripDecorativeEmojis = (t) =>
    t
      .replace(/[▪️✅⏹️💧🎈❗️📌🔻★○●■✔♦🎴]/g, '')
      .replace(/__+/g, '')
      .trim();

  let bodyText = stripDecorativeEmojis(bodyLines.join('\n'));

  if (!bodyText && normalized) {
    bodyText = stripDecorativeEmojis(normalized);
  }

  let { bullets, paragraphs } = splitBulletsAndParagraphs(bodyText);

  if (bullets.length === 0 && paragraphs.length === 0 && bodyText) {
    const fallback = bodyText
      .split(/\n{2,}|\n(?=[A-Z•])/)
      .map((p) => p.replace(/\s+/g, ' ').trim())
      .filter((p) => p.length > 0 && !isNoiseLine(p));
    ({ bullets, paragraphs } = splitBulletsAndParagraphs(fallback.join('\n')));
    if (bullets.length === 0 && paragraphs.length === 0) {
      paragraphs = fallback;
    }
  }

  if (bullets.length === 0 && paragraphs.length === 1 && /\.\*\s|\s\*\s+/.test(paragraphs[0])) {
    const expanded = expandAsteriskBullets(paragraphs[0]);
    ({ bullets, paragraphs } = splitBulletsAndParagraphs(expanded));
  }

  return { highlightFacts, paragraphs, bullets, normalized };
}

export function formatFactLabel(label) {
  return String(label)
    .split('/')
    .map((part) => part.trim())
    .map((part) => part.replace(/\b[a-z]/g, (c) => c.toUpperCase()))
    .join(' / ');
}