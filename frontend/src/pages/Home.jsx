/**
 * Landing page.
 *
 * Hero search redirects to /jobs with query param; stats and latest jobs
 * come from GET /api/jobs/stats and GET /api/jobs (first 6).
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getJobs, getStatus } from '../api/jobs.api';
//import JobCard from '../components/JobCard'

export default function () {
  const [search, setSearch] = useState('');
  const [latestJobs, setLatestJobs] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    companiesTracked: 0,
    jobSeeker: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    getJobs()
      .then((res) => setLatestJobs(res.data.slice(0, 6)))
      .catch(() => {});
    getStatus()
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
          Find your next job, faster than ever
        </h1>
        <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
          Aggregate listings from top companies, track applications on a kanban
          board, and score your resume with AI.
        </p>

        <form className="max-w-xl mx-auto flex gap-2">
          <input
            type="text"
            value
            onChange
            placeholder="Search jobs, companies..."
            className="flex-1 bg-bg-card border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-blue-primary"
          />
          <button
            type="submit"
            className="bg-blue-primary hover:bg-blue-hover text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Search
          </button>
        </form>
      </section>
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-bg-card border border-border rounded-card p-6 text-center">
            <p className="text-3xl font-bold text-blue-text">stats-totalJobs</p>
            <p className="text-text-secondary mt-1">Total Jobs</p>
          </div>
          <div className="bg-bg-card border border-border rounded-card p-6 text-center">
            <p className="text-3xl font-bold text-blue-text">
              stats-companiesTracked
            </p>
            <p className="text-text-secondary mt-1">Companies Tracked</p>
          </div>
          <div className="bg-bg-card border border-border rounded-card p-6 text-center">
            <p className="text-3xl font-bold text-blue-text">
              stats-jobSeekers
            </p>
            <p className="text-text-secondary mt-1">Job Seekers</p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Latest Jobs</h2>
          <Link
            to="/jobs"
            className="text-blue-text hover:underline text-sm font-medium"
          >
            See all jobs →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>

        <p className="text-text-muted text-center py-12">
          No jobs yet. Run the seed script to add sample data.
        </p>
      </section>
    </div>
  );
}
