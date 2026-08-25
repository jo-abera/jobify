/**
 * Formats ISO date strings for tracker cards and similar UI.
 * @param {string} dateString - Date from API (e.g. savedAt)
 * @returns {string} e.g. "May 29, 2026"
 */

export function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
