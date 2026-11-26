import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getJobsByIds } from '../api/jobs.api';
import { getSavedJobs } from '../api/tracker.api';
import { useAuth } from '../context/AuthContext';
import JobCard from './JobCard';
import {
  clearRecentlyViewed,
  getRecentlyViewedIds,
  pruneRecentlyViewedIds,
  RECENT_VIEWS_CHANGED,
} from '../utils/recentlyViewedJobs';

export default function RecentlyViewedJobs({
  compact = false,
  className = '',
  headingClassName = 'text-lg font-bold text-text-primary',
}) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState([]);

  const load = useCallback(() => {
    const ids = getRecentlyViewedIds();
    if (ids.length === 0) {
      setJobs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getJobsByIds(ids)
      .then((res) => {
        const list = res.data?.jobs ?? [];
        setJobs(list);
        pruneRecentlyViewedIds(list.map((j) => j.id));
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const onChange = () => load();
    window.addEventListener(RECENT_VIEWS_CHANGED, onChange);
    return () => window.removeEventListener(RECENT_VIEWS_CHANGED, onChange);
  }, [load]);

  useEffect(() => {
    if (!user) {
      setSavedJobIds([]);
      return;
    }
    getSavedJobs()
      .then((res) => setSavedJobIds(res.data.map((s) => s.jobId)))
      .catch(() => {});
  }, [user]);

  if (!loading && jobs.length === 0) {
    return null;
  }

  const gridClass = compact
    ? 'grid grid-cols-1 gap-3'
    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

  return (
    <section className={className}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-text-muted">
            Your history
          </p>
          <h2 className={headingClassName}>Recently viewed</h2>
        </div>
        {!loading && jobs.length > 0 && (
          <button
            type="button"
            onClick={() => {
              clearRecentlyViewed();
              setJobs([]);
            }}
            className="text-xs font-medium text-text-secondary hover:text-red-400"
          >
            Clear history
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-text-muted py-4">Loading recent jobs…</p>
      ) : (
        <div className={gridClass}>
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              savedJobIds={savedJobIds}
              onSaved={(id) => setSavedJobIds((prev) => [...prev, id])}
            />
          ))}
        </div>
      )}

      {!compact && !loading && jobs.length > 0 && (
        <p className="mt-3 text-xs text-text-muted">
          Stored on this device only.{' '}
          <Link to="/jobs" className="text-blue-text hover:underline">
            Browse all jobs
          </Link>
        </p>
      )}
    </section>
  );
}