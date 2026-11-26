import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import {
  dateInputToIso,
  followUpDueState,
  toDateInputValue,
} from '../../utils/trackerDates';
import { TRACKER_STAGES, normalizeTrackerStatus } from '../../constants/trackerStages';

const MAX_NOTES = 2000;

export default function TrackerJobCard({
  saved,
  onStatusChange,
  onNotesSave,
  onAppliedAtSave,
  onFollowUpAtSave,
  onDelete,
  compact = false,
}) {
  const [notes, setNotes] = useState(saved.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState('');
  const [appliedDate, setAppliedDate] = useState(toDateInputValue(saved.appliedAt));
  const [savingApplied, setSavingApplied] = useState(false);
  const [appliedError, setAppliedError] = useState('');
  const [followUpDate, setFollowUpDate] = useState(toDateInputValue(saved.followUpAt));
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [followUpError, setFollowUpError] = useState('');

  const stage = normalizeTrackerStatus(saved.status);
  const followUpState = followUpDueState(saved.followUpAt);

  useEffect(() => {
    setNotes(saved.notes || '');
    setNotesError('');
    setAppliedDate(toDateInputValue(saved.appliedAt));
    setAppliedError('');
    setFollowUpDate(toDateInputValue(saved.followUpAt));
    setFollowUpError('');
  }, [saved.id, saved.notes, saved.appliedAt, saved.followUpAt]);

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
        {saved.appliedAt && (
          <p className="text-blue-text text-xs mt-0.5 font-medium">
            Applied {formatDate(saved.appliedAt)}
          </p>
        )}
        {saved.followUpAt && (
          <p
            className={`text-xs mt-0.5 font-medium ${
              followUpState === 'overdue'
                ? 'text-red-400'
                : followUpState === 'today'
                  ? 'text-amber-500'
                  : 'text-text-secondary'
            }`}
          >
            Follow up {formatDate(saved.followUpAt)}
            {followUpState === 'overdue' && ' · overdue'}
            {followUpState === 'today' && ' · today'}
          </p>
        )}
      </Link>

      <div className="mt-2 space-y-1.5" onClick={(e) => e.stopPropagation()}>
          <label
            htmlFor={`tracker-applied-${saved.id}`}
            className="text-[0.65rem] font-bold uppercase tracking-wider text-text-muted"
          >
            Application date
          </label>
          <div className="flex gap-2">
            <input
              id={`tracker-applied-${saved.id}`}
              type="date"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-border bg-bg-secondary px-2 py-1.5 text-xs text-text-primary focus:border-border-hover focus:outline-none"
            />
            <button
              type="button"
              disabled={
                savingApplied ||
                appliedDate === toDateInputValue(saved.appliedAt) ||
                (!appliedDate && !saved.appliedAt)
              }
              onClick={async () => {
                setSavingApplied(true);
                setAppliedError('');
                try {
                  await onAppliedAtSave(
                    saved.id,
                    appliedDate ? dateInputToIso(appliedDate) : null
                  );
                } catch (err) {
                  const msg =
                    err?.response?.data?.detail ||
                    err?.response?.data?.message ||
                    'Could not save date.';
                  setAppliedError(msg);
                } finally {
                  setSavingApplied(false);
                }
              }}
              className="shrink-0 rounded-lg border border-border bg-bg-card px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:bg-bg-hover disabled:opacity-40"
            >
              {savingApplied ? '…' : 'Save'}
            </button>
          </div>
          {appliedError && <p className="text-xs text-red-400">{appliedError}</p>}
        {stage === 'saved' && !saved.appliedAt && (
          <p className="text-[0.65rem] text-text-muted">
            Move to Applied to set today automatically, or pick a date here.
          </p>
        )}
      </div>

      <div className="mt-2 space-y-1.5" onClick={(e) => e.stopPropagation()}>
        <label
          htmlFor={`tracker-follow-up-${saved.id}`}
          className="text-[0.65rem] font-bold uppercase tracking-wider text-text-muted"
        >
          Follow-up reminder
        </label>
        <div className="flex gap-2">
          <input
            id={`tracker-follow-up-${saved.id}`}
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-border bg-bg-secondary px-2 py-1.5 text-xs text-text-primary focus:border-border-hover focus:outline-none"
          />
          <button
            type="button"
            disabled={
              savingFollowUp ||
              followUpDate === toDateInputValue(saved.followUpAt) ||
              (!followUpDate && !saved.followUpAt)
            }
            onClick={async () => {
              setSavingFollowUp(true);
              setFollowUpError('');
              try {
                await onFollowUpAtSave(
                  saved.id,
                  followUpDate ? dateInputToIso(followUpDate) : null
                );
              } catch (err) {
                const msg =
                  err?.response?.data?.detail ||
                  err?.response?.data?.message ||
                  'Could not save reminder.';
                setFollowUpError(msg);
              } finally {
                setSavingFollowUp(false);
              }
            }}
            className="shrink-0 rounded-lg border border-border bg-bg-card px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:bg-bg-hover disabled:opacity-40"
          >
            {savingFollowUp ? '…' : 'Save'}
          </button>
        </div>
        {followUpError && <p className="text-xs text-red-400">{followUpError}</p>}
      </div>

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