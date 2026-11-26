import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import { TRACKER_STAGES, normalizeTrackerStatus } from '../../constants/trackerStages';

const MAX_NOTES = 2000;

export default function TrackerJobCard({
  saved,
  onStatusChange,
  onNotesSave,
  onDelete,
  compact = false,
}) {
  const [notes, setNotes] = useState(saved.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState('');

  useEffect(() => {
    setNotes(saved.notes || '');
    setNotesError('');
  }, [saved.id, saved.notes]);

  const savedNotes = saved.notes || '';
  const notesDirty = notes !== savedNotes;

  const handleSaveNotes = async () => {
    if (!notesDirty || savingNotes) return;
    setSavingNotes(true);
    setNotesError('');
    try {
      await onNotesSave(saved.id, notes.trim() ? notes.trim().slice(0, MAX_NOTES) : '');
    } catch {
      setNotesError('Could not save notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div
      className={`rounded-xl border border-border bg-bg-card shadow-sm transition-colors hover:border-border-hover hover:bg-bg-hover ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      <Link to={`/jobs/${saved.job.id}`} className="block">
        <h3 className="font-medium text-text-primary text-sm truncate">{saved.job.title}</h3>
        <p className="text-text-secondary text-xs mt-0.5">{saved.job.company}</p>
        <p className="text-text-muted text-xs mt-1">Saved {formatDate(saved.savedAt)}</p>
      </Link>

      <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
        <label
          htmlFor={`tracker-notes-${saved.id}`}
          className="text-[0.65rem] font-bold uppercase tracking-wider text-text-muted"
        >
          Notes
        </label>
        <textarea
          id={`tracker-notes-${saved.id}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, MAX_NOTES))}
          placeholder="Recruiter name, next steps, salary discussed…"
          rows={compact ? 2 : 3}
          className="w-full resize-y rounded-lg border border-border bg-bg-secondary px-2.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-border-hover focus:outline-none focus:ring-0"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[0.65rem] text-text-muted tabular-nums">
            {notes.length}/{MAX_NOTES}
          </span>
          <button
            type="button"
            onClick={() => void handleSaveNotes()}
            disabled={!notesDirty || savingNotes}
            className="rounded-lg bg-blue-primary px-3 py-1 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {savingNotes ? 'Saving…' : 'Save notes'}
          </button>
        </div>
        {notesError && <p className="text-xs text-red-400">{notesError}</p>}
      </div>

      <select
        value={normalizeTrackerStatus(saved.status)}
        onChange={(e) => onStatusChange(saved.id, e.target.value)}
        className="mt-3 w-full bg-bg-secondary border border-border rounded-lg text-xs text-text-secondary px-2 py-1.5 focus:outline-none focus:ring-0 focus:border-border-hover"
      >
        {TRACKER_STAGES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onDelete(saved.id)}
        className="mt-2 w-full text-xs text-red-400 hover:text-red-300 transition-colors"
      >
        Remove
      </button>
    </div>
  );
}