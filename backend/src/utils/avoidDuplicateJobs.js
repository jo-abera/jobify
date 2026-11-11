// Small helpers so the same job is not saved twice when different channels
// post it (for example Josad reposting a job that already appeared elsewhere).

// These query params often get added when you share a link — we remove them
// so "same job, different link" still matches.
const extraQueryKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "ref",
  "gclid",
];

// Make two links look the same when they point to the same place.
// Example: HTTPS vs www, trailing slash, or ?utm_source=telegram
function normalizeJobUrl(raw) {
  if (!raw || typeof raw !== "string") return null;

  const text = raw.trim();

  try {
    const link = new URL(text);

    link.hostname = link.hostname.toLowerCase().replace(/^www\./, "");
    link.hash = "";

    for (const key of extraQueryKeys) {
      link.searchParams.delete(key);
    }
    if (link.searchParams.size === 0) {
      link.search = "";
    }

    if (link.pathname.length > 1 && link.pathname.endsWith("/")) {
      link.pathname = link.pathname.slice(0, -1);
    }

    return link.toString();
  } catch {
    // If it's not a valid URL string, just use what we got
    return text;
  }
}

// True when the link is only a Telegram post (t.me/...), not a company apply page
function isTelegramOnlyUrl(raw) {
  const cleaned = normalizeJobUrl(raw);
  if (!cleaned) return false;

  try {
    const host = new URL(cleaned).hostname;
    return host === "t.me" || host === "telegram.me";
  } catch {
    return cleaned.includes("t.me/");
  }
}

// We already have a job in the DB — which url should we keep?
// Keep the real apply link if we had Telegram before.
function preferJobUrl(urlInDb, urlFromNewPost) {
  const oldLink = normalizeJobUrl(urlInDb);
  const newLink = normalizeJobUrl(urlFromNewPost);

  if (!oldLink) return newLink;
  if (!newLink) return oldLink;

  const oldIsTelegram = isTelegramOnlyUrl(oldLink);
  const newIsTelegram = isTelegramOnlyUrl(newLink);

  if (oldIsTelegram && !newIsTelegram) {
    return newLink;
  }

  return oldLink;
}

// What url do we save on a brand-new row?
// 1) apply link from the message (if it's not just t.me)
// 2) else link to the Telegram message itself
function pickStoredUrl(applyLink, messageUrl) {
  const apply = applyLink ? normalizeJobUrl(applyLink) : null;
  const telegram = messageUrl ? normalizeJobUrl(messageUrl) : null;

  if (apply && !isTelegramOnlyUrl(apply)) {
    return apply;
  }
  if (telegram) {
    return telegram;
  }
  if (apply) {
    return apply;
  }
  return null;
}

module.exports = {
  normalizeJobUrl,
  isTelegramOnlyUrl,
  preferJobUrl,
  pickStoredUrl,
};
