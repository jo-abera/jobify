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

/** `overdue` | `today` | `upcoming` for reminder styling. */
export function followUpDueState(isoString) {
  if (!isoString) return null;
  const due = new Date(isoString);
  if (Number.isNaN(due.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);
  if (dueDay < today) return 'overdue';
  if (dueDay.getTime() === today.getTime()) return 'today';
  return 'upcoming';
}