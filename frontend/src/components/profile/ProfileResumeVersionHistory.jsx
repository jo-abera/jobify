import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatDate';
import {
  deleteResumeVersion,
  downloadResumeVersion,
  listResumeVersions,
  openResumeVersion,
  setResumeVersionCurrent,
} from '../../api/resume.api';

function typeBadge(fileName) {
  const lower = String(fileName || '').toLowerCase();
  if (lower.endsWith('.pdf')) return 'PDF';
  if (lower.endsWith('.docx')) return 'DOCX';
  if (lower.endsWith('.txt')) return 'TXT';
  return 'File';
}

function actionError(err) {
  if (err.code === 'POPUP_BLOCKED') return err.message;
  return err.response?.data?.message || err.message || 'Something went wrong.';
}

export default function ProfileResumeVersionHistory({ refreshKey = 0 }) {
  const { user, login } = useAuth();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const syncUser = (updatedUser) => {
    const token = localStorage.getItem('token');
    login(updatedUser, token || undefined);
  };

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    listResumeVersions()
      .then((res) => setVersions(res.data.data?.versions ?? []))
      .catch((err) =>
        setError(
          err.response?.data?.message ||
            'Could not load upload history. Restart the backend after `npx prisma db push`.'
        )
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const runAction = async (id, fn) => {
    setBusyId(id);
    setError('');
    try {
      await fn();
      load();
    } catch (err) {
      setError(actionError(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleSetCurrent = (version) =>
    runAction(version.id, async () => {
      const res = await setResumeVersionCurrent(version.id);
      syncUser(res.data.data.user);
    });

  const handleDelete = (version) => {
    if (!window.confirm(`Remove "${version.resumeFileName}" from history?`)) return;
    runAction(version.id, async () => {
      const res = await deleteResumeVersion(version.id);
      if (res.data.data?.user) syncUser(res.data.data.user);
    });
  };

  return (
    <section className="rounded-2xl border border-border bg-bg-primary p-5">
      <h3 className="text-sm font-semibold text-text-primary">Upload history</h3>
      <p className="mt-1 text-xs text-text-muted">
        Each save is kept here. Restoring a version makes it your current resume again.
      </p>

      {loading && <p className="mt-4 text-sm text-text-muted">Loading history…</p>}

      {!loading && versions.length === 0 && (
        <p className="mt-4 text-sm text-text-muted">No uploads yet.</p>
      )}

      {!loading && versions.length > 0 && (
        <ul className="mt-4 space-y-3">
          {versions.map((version) => {
            const isCurrent = version.isCurrent;
            const busy = busyId === version.id;
            return (
              <li
                key={version.id}
                className="rounded-xl border border-border bg-bg-card px-4 py-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {version.resumeFileName}
                      </p>
                      <span className="rounded-full bg-bg-secondary px-2 py-0.5 text-xs text-text-muted">
                        {typeBadge(version.resumeFileName)}
                      </span>
                      {isCurrent && (
                        <span className="rounded-full bg-blue-light px-2 py-0.5 text-xs font-semibold text-blue-text">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-text-muted">
                      Uploaded {formatDate(version.uploadedAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        runAction(version.id, () => openResumeVersion(version.id))
                      }
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-bg-hover disabled:opacity-50"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        runAction(version.id, () =>
                          downloadResumeVersion(version.id, version.resumeFileName)
                        )
                      }
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-bg-hover disabled:opacity-50"
                    >
                      Download
                    </button>
                    {!isCurrent && (
                      <button
                        type="button"
                        disabled={busy || !user}
                        onClick={() => handleSetCurrent(version)}
                        className="rounded-lg border border-blue-primary/30 bg-blue-light px-3 py-1.5 text-xs font-medium text-blue-text hover:bg-blue-primary/15 disabled:opacity-50"
                      >
                        Use as current
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleDelete(version)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-rejected disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
    </section>
  );
}