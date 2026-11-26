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

function stageMeta(stageId) {
  return TRACKER_STAGES.find((s) => s.id === stageId) || TRACKER_STAGES[0];
}

function DateFieldRow({ id, label, value, onChange, onSave, saving, savedValue, error }) {
  const unchanged =
    value === toDateInputValue(savedValue) || (!value && !savedValue);
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-[0.65rem] font-semibold text-text-muted">
        {label}
      </label>
      <div className="flex gap-1.5">
        <input
          id={id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 rounded-md border border-border bg-bg-secondary px-2 py-1.5 text-xs text-text-primary focus:border-border-hover focus:outline-none"
        />
        <button
          type="button"
          disabled={saving || unchanged}
          onClick={onSave}
          className="shrink-0 rounded-md border border-border bg-bg-card px-2 py-1.5 text-xs font-medium text-text-secondary hover:bg-bg-hover disabled:opacity-40"
        >
          {saving ? '…' : 'Save'}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

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
  const [detailsOpen, setDetailsOpen] = useState(false);

  const stage = normalizeTrackerStatus(saved.status);
  const followUpState = followUpDueState(saved.followUpAt);
  const current = stageMeta(stage);

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
  const hasDetails =
    Boolean(saved.notes) ||
    Boolean(saved.appliedAt) ||
    Boolean(saved.followUpAt) ||
    detailsOpen;

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
    <article
      className={`flex flex-col rounded-xl border border-border bg-bg-card shadow-sm transition-colors hover:border-border-hover hover:bg-bg-hover ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      <div className="flex items-start gap-2">
        <Link to={`/jobs/${saved.job.id}`} className="min-w-0 flex-1">
          <h3 className="font-semibold text-text-primary text-sm leading-snug line-clamp-2">
            {saved.job.title}
          </h3>
          <p className="text-text-secondary text-xs mt-0.5 truncate">{saved.job.company}</p>
        </Link>
        <span
          className="shrink-0 rounded-md bg-bg-secondary px-1.5 py-0.5 text-[0.65rem] font-semibold text-text-secondary ring-1 ring-border"
          title={current.label}
        >
          {current.label}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="rounded-md bg-bg-secondary px-1.5 py-0.5 text-[0.65rem] text-text-muted">
          Saved {formatDate(saved.savedAt)}
        </span>
        {saved.appliedAt && (
          <span className="rounded-md bg-blue-light/80 px-1.5 py-0.5 text-[0.65rem] font-medium text-blue-text">
            Applied {formatDate(saved.appliedAt)}
          </span>
        )}
        {saved.followUpAt && (
          <span
            className={`rounded-md px-1.5 py-0.5 text-[0.65rem] font-medium ${
              followUpState === 'overdue'
                ? 'bg-red-500/15 text-red-400'
                : followUpState === 'today'
                  ? 'bg-amber-500/15 text-amber-600'
                  : 'bg-bg-secondary text-text-secondary'
            }`}
          >
            Follow-up {formatDate(saved.followUpAt)}
            {followUpState === 'overdue' && ' · overdue'}
            {followUpState === 'today' && ' · today'}
          </span>
        )}
      </div>

      {saved.notes && !detailsOpen && (
        <p className="mt-2 text-xs text-text-muted line-clamp-2 italic">{saved.notes}</p>
      )}

      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
        <select
          value={stage}
          onChange={(e) => onStatusChange(saved.id, e.target.value)}
          aria-label="Application stage"
          className="w-full rounded-lg border border-border bg-bg-secondary text-xs text-text-secondary px-2 py-2 focus:border-border-hover focus:outline-none focus:ring-0"
        >
          {TRACKER_STAGES.map((s) => (
            <option key={s.id} value={s.id}>
              Move to {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 border-t border-border/70 pt-2" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => setDetailsOpen((o) => !o)}
          aria-expanded={detailsOpen}
          className="flex w-full items-center justify-between text-left text-xs font-medium text-blue-text hover:underline"
        >
          {detailsOpen ? 'Hide dates & notes' : 'Dates & notes'}
          <span className="text-text-muted" aria-hidden>
            {detailsOpen ? '−' : '+'}
          </span>
        </button>

        {detailsOpen && (
          <div className="mt-3 space-y-3">
            <DateFieldRow
              id={`tracker-applied-${saved.id}`}
              label="Application date"
              value={appliedDate}
              onChange={setAppliedDate}
              saving={savingApplied}
              savedValue={saved.appliedAt}
              error={appliedError}
              onSave={async () => {
                setSavingApplied(true);
                setAppliedError('');
                try {
                  await onAppliedAtSave(
                    saved.id,
                    appliedDate ? dateInputToIso(appliedDate) : null
                  );
                } catch (err) {
                  setAppliedError(
                    err?.response?.data?.detail ||
                      err?.response?.data?.message ||
                      'Could not save date.'
                  );
                } finally {
                  setSavingApplied(false);
                }
              }}
            />
            {stage === 'saved' && !saved.appliedAt && (
              <p className="text-[0.65rem] text-text-muted">
                Moving to Applied sets today if empty.
              </p>
            )}

            <DateFieldRow
              id={`tracker-follow-up-${saved.id}`}
              label="Follow-up reminder"
              value={followUpDate}
              onChange={setFollowUpDate}
              saving={savingFollowUp}
              savedValue={saved.followUpAt}
              error={followUpError}
              onSave={async () => {
                setSavingFollowUp(true);
                setFollowUpError('');
                try {
                  await onFollowUpAtSave(
                    saved.id,
                    followUpDate ? dateInputToIso(followUpDate) : null
                  );
                } catch (err) {
                  setFollowUpError(
                    err?.response?.data?.detail ||
                      err?.response?.data?.message ||
                      'Could not save reminder.'
                  );
                } finally {
                  setSavingFollowUp(false);
                }
              }}
            />

            <div className="space-y-1.5">
              <label
                htmlFor={`tracker-notes-${saved.id}`}
                className="text-[0.65rem] font-semibold text-text-muted"
              >
                Notes
              </label>
              <textarea
                id={`tracker-notes-${saved.id}`}
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, MAX_NOTES))}
                placeholder="Recruiter, next steps…"
                rows={compact ? 2 : 3}
                className="w-full resize-y rounded-md border border-border bg-bg-secondary px-2.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-border-hover focus:outline-none focus:ring-0"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-[0.65rem] text-text-muted tabular-nums">
                  {notes.length}/{MAX_NOTES}
                </span>
                <button
                  type="button"
                  onClick={() => void handleSaveNotes()}
                  disabled={!notesDirty || savingNotes}
                  className="rounded-md bg-blue-primary px-2.5 py-1 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {savingNotes ? 'Saving…' : 'Save notes'}
                </button>
              </div>
              {notesError && <p className="text-xs text-red-400">{notesError}</p>}
            </div>
          </div>
        )}

        {!detailsOpen && hasDetails && (
          <p className="mt-1 text-[0.65rem] text-text-muted">Expand to edit dates or notes.</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDelete(saved.id)}
        className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors text-left"
      >
        Remove from tracker
      </button>
    </article>
  );
}