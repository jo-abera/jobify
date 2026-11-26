function normalizeProfileUrl(raw) {
  if (raw === undefined) return undefined;
  const s = String(raw ?? "").trim();
  if (!s) return null;
  const href = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(href);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return href;
  } catch {
    return null;
  }
}

function isValidProfileUrl(value) {
  if (!value) return false;
  return normalizeProfileUrl(value) !== null;
}

module.exports = { normalizeProfileUrl, isValidProfileUrl };