/** `YYYY-MM-DD` for `<input type="date">` from an ISO timestamp. */
export function toDateInputValue(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Local calendar date → ISO for API (midday avoids UTC day shift). */
export function dateInputToIso(dateInput) {
  if (!dateInput) return null;
  const d = new Date(`${dateInput}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}