/**
 * Application tracker — kanban board for saved jobs.
 *
 * Columns map to SavedJob.status values. Status dropdown includes "rejected"
 * (cards with rejected status won't appear in a column until a Rejected column
 * is added). Data from GET /api/tracker; updates via PATCH /api/tracker/:id.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSavedJobs, updateStatus, removeJob } from '../api/tracker.api';
import { formatDate } from '../utils/formatDate';

/** Visible kanban columns (status id must match SavedJob.status in the API). */

const COLUMNS = [
  { id: 'saved', label: 'Saved' },
  { id: 'applied', label: 'Applied' },
  { id: 'interviewing', label: 'Interviewing' },
  { id: 'offered', label: 'Offered' },
];

/** All statuses allowed in the per-card dropdown (includes rejected). */

const STATUSES = ['saved', 'applied', 'interviewing', 'offered', 'rejected'];

export default function Tracker() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    getSavedJobs()
      .then((res) => {
        setSavedJobs(res.data);
      })
      .catch((err) => {
        console.error('Error fetching saved jobs:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const stats = {
    total: savedJobs.length,
    applied: savedJobs.filter((s) => s.status === 'applied').length,
    interviewing: savedJobs.filter((s) => s.status === 'interviewing').length,
    offered: savedJobs.filter((s) => s.status === 'offered').length,
  };

  const handleStatusChange = async (savedId, status) => {
    try {
      const updated = await updateStatus(savedId, { status });
      setSavedJobs((prev) =>
        prev.map((s) => (s.id === savedId ? updated.data : s))
      );
    } catch {
      /* optimistic UI not rolled back — user can retry */
    }
  };

  const handleDelete = async (savedId) => {
    try {
      await removeJob(savedId);
      setSavedJobs((prev) => prev.filter((s) => s.id !== savedId));
    } catch {
      /* ignore */
    }
  };

  const getColumnJobs = (status) => {
    return savedJobs.filter((s) => s.status === status);
  };
  if (loading)
    return (
      <p className="text-text-muted text-center py-12">Loading tracker...</p>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        Application Tracker
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-bg-card border border-border rounded-card p-4 text-center">
          <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
          <p className="text-text-secondary text-sm">Total</p>
        </div>
        <div className="bg-bg-card border border-border rounded-card p-4 text-center">
          <p className="text-2xl font-bold text-blue-text">{stats.applied}</p>
          <p className="text-text-secondary text-sm">Applied</p>
        </div>
        <div className="bg-bg-card border border-border rounded-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-300">
            {stats.interviewing}
          </p>
          <p className="text-text-secondary text-sm">Interviewing</p>
        </div>
        <div className="bg-bg-card border border-border rounded-card p-4 text-center">
          <p className="text-2xl font-bold text-green-300">{stats.offered}</p>
          <p className="text-text-secondary text-sm">Offered</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="min-h-[400px]">
            <div className="bg-bg-secondary border border-border border-t-4 border-t-border rounded-t-card px-4 py-3">
              <h2 className="font-semibold text-text-primary">{col.label}</h2>
              <p className="text-text-muted text-xs">
                {getColumnJobs(col.id).length} jobs
              </p>
            </div>
            <div className="bg-bg-secondary border border-t-0 border-border rounded-b-card p-3 space-y-3 min-h-[360px]">
              {getColumnJobs(col.id).map((saved) => (
                <div
                  key={saved.id}
                  className="bg-bg-card border border-border rounded-lg p-4 hover:bg-bg-hover transition-colors"
                >
                  <Link to={`/jobs/${saved.job.id}`} className="block">
                    <h3 className="font-medium text-text-primary text-sm truncate">
                      {saved.job.title}
                    </h3>
                    <p className="text-text-secondary text-xs mt-0.5">
                      {saved.job.company}
                    </p>
                    <p className="text-text-muted text-xs mt-1">
                      {formatDate(saved.savedAt)}
                    </p>
                  </Link>
                  {saved.notes && (
                    <p className="text-text-muted text-xs mt-2 italic truncate">
                      {saved.notes}
                    </p>
                  )}
                  <select
                    value={saved.status}
                    onChange={(e) =>
                      handleStatusChange(saved.id, e.target.value)
                    }
                    className="mt-3 w-full bg-bg-secondary border border-border rounded text-xs text-text-secondary px-2 py-1.5 focus:outline-none focus:border-blue-primary"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDelete(saved.id)}
                    className="mt-2 w-full text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
