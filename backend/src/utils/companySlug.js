const crypto = require("crypto");

/** URL-safe slug from a company display name (Latin, Ethiopic, and other letters). */
function slugifyCompany(name) {
  const raw = String(name || "").trim();
  const base = raw
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
  if (base) return base;
  const digest = crypto
    .createHash("sha256")
    .update(raw)
    .digest("hex")
    .slice(0, 12);
  return `org-${digest}`;
}

module.exports = { slugifyCompany };