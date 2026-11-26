/**
 * Application tracker — kanban board for saved jobs.
 */
import { useState, useEffect } from 'react';
import { getSavedJobs, updateStatus, removeJob } from '../api/tracker.api';
import SectionHeading from '../components/SectionHeading';
import { TrackerStatsBar, KanbanLayout } from '../components/tracker/TrackerLayoutViews';
import { TRACKER_STAGES, normalizeTrackerStatus } from '../constants/trackerStages';

export default function Tracker() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedJobs()
      .then((res) => setSavedJobs(res.data))
      .catch((err) => console.error('Error fetching saved jobs:', err))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: savedJobs.length,
    ...Object.fromEntries(
      TRACKER_STAGES.map((stage) => [
        stage.id,
        savedJobs.filter(
          (s) => normalizeTrackerStatus(s.status) === stage.id
        ).length,
      ])
    ),
  };

  const handleStatusChange = async (savedId, status) => {
    try {
      const updated = await updateStatus(savedId, { status });
      setSavedJobs((prev) => prev.map((s) => (s.id === savedId ? updated.data : s)));
    } catch {
      /* user can retry */
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

  const getColumnJobs = (status) =>
    savedJobs.filter((s) => normalizeTrackerStatus(s.status) === status);

  if (loading) {
    return <p className="text-text-muted text-center py-12">Loading tracker...</p>;
  }

  return (
    <div>
      <section className="border-b border-border bg-bg-secondary/40">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-12">
          <SectionHeading
            headingTag="h1"
            className="mb-0"
            overline="Your pipeline"
            title="Application tracker"
            description="Move saved roles through each stage and update status as you hear back."
          />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <TrackerStatsBar stats={stats} />
        <KanbanLayout
          getColumnJobs={getColumnJobs}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}