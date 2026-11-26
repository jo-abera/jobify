/**
 * Infer job category for scraped / manual jobs.
 *
 * Priority:
 * 1. Source label from the post (canonical name or alias, e.g. Category: IT)
 * 2. Keyword / regex on title + description
 * 3. Other
 */

const {
  DEFAULT_JOB_CATEGORY,
  isValidJobCategory,
  normalizeJobCategory,
} = require('../constants/jobCategories');

/** { category, patterns } — first matching category with a hit wins (ordered by specificity). */
const RULES = [
  {
    category: 'Human Resources',
    patterns: [
      /\bhr\b/i,
      /human\s+resources?/i,
      /recruiter/i,
      /recruitment/i,
      /talent\s+acquisition/i,
      /people\s+operations?/i,
    ],
  },
  {
    category: 'Legal',
    patterns: [/lawyer/i, /\blegal\b/i, /attorney/i, /compliance\s+officer/i, /paralegal/i],
  },
  {
    category: 'Data',
    patterns: [
      /data\s+(scientist|analyst|engineer)/i,
      /\bbi\s+(analyst|developer|engineer)\b/i,
      /machine\s+learning/i,
      /\bml\s+engineer/i,
      /analytics/i,
    ],
  },
  {
    category: 'Design',
    patterns: [
      /ui\/?ux/i,
      /\bux\s+designer/i,
      /\bui\s+designer/i,
      /graphic\s+design/i,
      /product\s+design/i,
      /visual\s+design/i,
      /\bfigma\b/i,
    ],
  },
  {
    category: 'Product',
    patterns: [
      /product\s+manager/i,
      /\bpm\b(?!\s*2\.5)/i,
      /product\s+owner/i,
      /product\s+lead/i,
    ],
  },
  {
    category: 'Engineering',
    patterns: [
      /software\s+(engineer|developer|dev)/i,
      /\b(full[\s-]?stack|frontend|front[\s-]?end|backend|back[\s-]?end)\b/i,
      /\b(devops|sre|site\s+reliability)\b/i,
      /mobile\s+(developer|engineer)/i,
      /\b(ios|android)\s+(developer|engineer)/i,
      /web\s+developer/i,
      /programmer/i,
      /\bengineer\b/i,
      /developer/i,
      /coding/i,
      /react\b/i,
      /node\.?js/i,
      /\bjava\b(?!\s*script)/i,
      /python\s+developer/i,
      /qa\s+(engineer|tester)/i,
      /\bqa\b/i,
      /quality\s+assurance/i,
      /system\s+admin/i,
      /\bit\s+support\s+engineer/i,
      /network\s+admin/i,
      /database\s+admin/i,
      /\bdba\b/i,
    ],
  },
  {
    category: 'Sales',
    patterns: [
      /sales\s+(representative|rep|executive|manager|lead)/i,
      /account\s+executive/i,
      /\bae\b/i,
      /business\s+development/i,
      /\bbdr\b/i,
      /\bsdr\b/i,
      /key\s+account/i,
    ],
  },
  {
    category: 'Marketing',
    patterns: [
      /marketing\s+(manager|specialist|coordinator|lead)/i,
      /digital\s+marketing/i,
      /content\s+(writer|strategist|marketing)/i,
      /social\s+media/i,
      /\bseo\b/i,
      /brand\s+manager/i,
      /communications?\s+officer/i,
      /public\s+relations/i,
      /\bpr\b/i,
    ],
  },
  {
    category: 'Finance',
    patterns: [
      /accountant/i,
      /accounting/i,
      /finance\s+(manager|officer|analyst)/i,
      /financial\s+analyst/i,
      /\bcfo\b/i,
      /auditor/i,
      /bookkeeper/i,
      /payroll/i,
      /treasury/i,
    ],
  },
  {
    category: 'Support',
    patterns: [
      /customer\s+(support|service|success)/i,
      /call\s+center/i,
      /help\s?desk/i,
      /technical\s+support/i,
      /client\s+support/i,
      /customer\s+care/i,
    ],
  },
  {
    category: 'Operations',
    patterns: [
      /operations\s+(manager|coordinator|lead)/i,
      /supply\s+chain/i,
      /logistics/i,
      /warehouse/i,
      /procurement/i,
      /office\s+manager/i,
      /administrative\s+assistant/i,
      /executive\s+assistant/i,
      /project\s+coordinator/i,
    ],
  },
];

function inferJobCategory({ title = '', description = '', sourceCategory = '' } = {}) {
  if (sourceCategory && isValidJobCategory(sourceCategory)) {
    return normalizeJobCategory(sourceCategory);
  }

  const mapped = mapSourceCategoryLabel(sourceCategory);
  if (mapped) return mapped;

  const text = `${title}\n${description}`.toLowerCase();

  let best = { category: DEFAULT_JOB_CATEGORY, score: 0 };

  for (const rule of RULES) {
    let score = 0;
    for (const pattern of rule.patterns) {
      if (pattern.test(text)) score += 1;
    }
    if (score > best.score) {
      best = { category: rule.category, score };
    }
  }

  if (best.score > 0) return best.category;

  return DEFAULT_JOB_CATEGORY;
}

/** Map free-text labels from postings (e.g. "Category: IT") to canonical names. */
function mapSourceCategoryLabel(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const label = raw.trim().toLowerCase();
  if (!label) return null;

  const aliases = {
    engineering: 'Engineering',
    software: 'Engineering',
    it: 'Engineering',
    tech: 'Engineering',
    technology: 'Engineering',
    sales: 'Sales',
    marketing: 'Marketing',
    finance: 'Finance',
    accounting: 'Finance',
    design: 'Design',
    creative: 'Design',
    support: 'Support',
    'customer service': 'Support',
    operations: 'Operations',
    ops: 'Operations',
    hr: 'Human Resources',
    'human resources': 'Human Resources',
    product: 'Product',
    data: 'Data',
    analytics: 'Data',
    legal: 'Legal',
  };

  if (aliases[label]) return aliases[label];

  const byPhrase = [
    ['software', 'Engineering'],
    ['information technology', 'Engineering'],
    ['customer service', 'Support'],
    ['human resource', 'Human Resources'],
    ['business development', 'Sales'],
  ];
  for (const [phrase, category] of byPhrase) {
    if (label.includes(phrase)) return category;
  }

  for (const [key, category] of Object.entries(aliases)) {
    if (key.length <= 3) {
      if (new RegExp(`\\b${key}\\b`, 'i').test(label)) return category;
    } else if (label.includes(key)) {
      return category;
    }
  }

  return isValidJobCategory(raw) ? normalizeJobCategory(raw) : null;
}

module.exports = { inferJobCategory, mapSourceCategoryLabel };