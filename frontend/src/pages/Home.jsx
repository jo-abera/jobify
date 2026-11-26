/**
 * Landing page.
 *
 * Hero search redirects to /jobs with query param; stats and latest jobs
 * come from GET /api/jobs/stats and GET /api/jobs (first 6).
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJobs, getStats, getCategoryCounts } from '../api/jobs.api';
import JobCard from '../components/JobCard';
import JobCategoryFilter from '../components/JobCategoryFilter';
import HomeHero from '../components/HomeHero';
import SectionHeading from '../components/SectionHeading';
import RecentlyViewedJobs from '../components/RecentlyViewedJobs';

export default function () {
  const [search, setSearch] = useState('');
  const [latestJobs, setLatestJobs] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    companiesTracked: 0,
    jobSeekers: 0,
  });
  const [categoryCounts, setCategoryCounts] = useState(null);
  const [categoryTotal, setCategoryTotal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getJobs()
      .then((res) => setLatestJobs(res.data.jobs.slice(0, 15)))
      .catch(() => {});
    getStats()
      .then((res) => setStats(res.data))
      .catch(() => {});
    getCategoryCounts()
      .then((res) => {
        setCategoryCounts(res.data?.byCategory ?? null);
        setCategoryTotal(res.data?.total ?? null);
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(search)}`);
  };

  const goToCategory = (category) => {
    if (!category) {
      navigate('/jobs');
      return;
    }
    navigate(`/jobs?category=${encodeURIComponent(category)}`);
  };

  return (
    <div>
      <HomeHero
        search={search}
        setSearch={setSearch}
        onSubmit={handleSearch}
        stats={stats}
      />

      <section className="border-t border-border bg-bg-primary">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <RecentlyViewedJobs className="mb-14" />
        </div>
      </section>

      <section className="border-t border-border bg-bg-secondary/40">
        <div className="max-w-6xl mx-auto px-4 py-12 pb-20">
          <SectionHeading
            overline="Open roles"
            title="Latest jobs"
            description="Recently added listings — pick a category or open any role for details and resume scoring."
            to="/jobs"
            linkLabel="See all jobs →"
          />
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-text-muted mb-3">
            Browse by category
          </p>
          <JobCategoryFilter
            value=""
            onChange={goToCategory}
            className="mb-8"
            countsByCategory={categoryCounts}
            totalCount={categoryTotal}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {latestJobs.length === 0 && (
            <p className="text-text-muted text-center py-12">
              No jobs yet. Run the seed script to add sample data.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}