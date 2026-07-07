/**
 * Job browse page with search and filters.
 *
 * URL search params (?search=) sync with the search input. JobFilter drives
 * type/location query params on GET /api/jobs. Logged-in users load saved
 * job IDs to show Save state on JobCard.
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getJobs } from '../api/jobs.api';
import {getSavedJobs} from '../api/tracker.api';
import {useAuth} from '../context/AuthContext';
import JobCard from '../components/JobCard';
import JobFilter from '../components/JobFilter';

/**
 * Extracts an approximate yearly salary number from strings like:
 * "$120k - $140k", "$45/hr", "$8,000/month".
 * Returns null when not parseable (no strict salary filtering in that case).
 */
function parseSalaryEstimate(salaryText) {
  if (!salaryText) return null;
  const text = salaryText.toLowerCase().replace(/,/g, '');
  const match = text.match(/(\d+(\.\d+)?)/);
  if (!match) return null;
  const raw = Number(match[1]);
  if (Number.isNaN(raw)) return null;

  if (text.includes('k')) return Math.round(raw * 1000);
  if (text.includes('/hr') || text.includes('hour'))
    return Math.round(raw * 2080);
  if (text.includes('/month') || text.includes('month'))
    return Math.round(raw * 12);
  return Math.round(raw);
}

/** Infers work mode from location text to match profile preferences. */

function inferWorkMode(location = '') {
  const value = location.toLowerCase();
  if (value.includes('remote')) return 'Remote';
  if (value.includes('hybrid')) return 'Hybrid';
  return 'On-site';
}

/**
 * Simple recommendation score based on profile skills, preferred type/mode,
 * and salary expectations. Higher score means better fit.
 */
function scoreJobForUser(job, user) {
  if (!user) return 0;
  const profileSkills = Array.isArray(user.skills) ? user.skills : [];
  const preferredTypes = Array.isArray(user.preferredJobTypes)
    ? user.preferredJobTypes
    : [];
  const preferredModes = Array.isArray(user.preferredWorkModes)
    ? user.preferredWorkModes
    : [];
  const salaryMin = user.salaryExpectationMin ?? null;
  const salaryMax = user.salaryExpectationMax ?? null;

  let score = 0;
  const corpus = `${job.title} ${job.company} ${job.description}`.toLowerCase();

  if (preferredTypes.length > 0 && preferredTypes.includes(job.type))
    score += 25;
  if (
    preferredModes.length > 0 &&
    preferredModes.includes(inferWorkMode(job.location))
  )
    score += 20;

  const salary = parseSalaryEstimate(job.salary);
  if (salary !== null && (salaryMin !== null || salaryMax !== null)) {
    const minOk = salaryMin === null || salary >= salaryMin;
    const maxOk = salaryMax === null || salary <= salaryMax;
    if (minOk && maxOk) score += 20;
  }

  profileSkills.forEach((skill) => {
    if (corpus.includes(String(skill).toLowerCase())) score += 6;
  });

  return score;
}

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [catalogJobs, setCatalogJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeFilter, setActiveFilter] = useState('all');
  const [usePreference, setUsePreference] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const { user } = useAuth();

  const hasPreferenceData = Boolean(
    user &&
    ((Array.isArray(user.preferredJobTypes) &&
      user.preferredJobTypes.length > 0) ||
      (Array.isArray(user.preferredWorkModes) &&
        user.preferredWorkModes.length > 0) ||
      user.salaryExpectationMin != null ||
      user.salaryExpectationMax != null)
  );

  const fetchJobs = () => {
    setLoading(true);
    const params = {};
    const q = searchParams.get('search');
    if (q) params.search = q;

    if (activeFilter.startsWith('type')) {
      params.type = activeFilter.replace('type:', '');
    }
    if (activeFilter.startsWith('loc:')) {
      params.location = 'Remote';
    }

    getJobs(params)
      .then((res) => setJobs(res.data))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  };

  const fetchCatalogJobs = () => {
    const params = {};
    const q = searchParams.get('search');
    if (q) params.search = q;
    getJobs(params)
      .then((res) => setCatalogJobs(res.data))
      .catch(() => setCatalogJobs([]));
  };

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    fetchJobs();
  }, [searchParams, activeFilter]);

  useEffect(() => {
    fetchCatalogJobs();
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      getSavedJobs()
        .then((res) => setSavedJobIds(res.data.map((s) => s.jobId)))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    // Auto-enable preference-based view when user has saved preferences.
    if (hasPreferenceData) setUsePreferences(true);
  }, [hasPreferenceData]);

  useEffect(() => {
    if (!user || catalogJobs.length === 0) {
      setRecommendedJobs([]);
      return;
    }
    const ranked = [...catalogJobs]
      .map((job) => ({ job, score: scoreJobForUser(job, user) }))
      .sort((a, b) => b.score - a.score)
      .filter((item) => item.score > 0)
      .slice(0, 3)
      .map((item) => item.job);
    setRecommendedJobs(ranked);
  }, [catalogJobs, user]);

  const jobsToRender =
    usePreferences && hasPreferenceData
      ? jobs.filter((job) => {
          const preferredTypes = Array.isArray(user?.preferredJobTypes)
            ? user.preferredJobTypes
            : [];
          const preferredModes = Array.isArray(user?.preferredWorkModes)
            ? user.preferredWorkModes
            : [];
          const salaryMin = user?.salaryExpectationMin ?? null;
          const salaryMax = user?.salaryExpectationMax ?? null;

          const typeOk =
            preferredTypes.length === 0 || preferredTypes.includes(job.type);
          const modeOk =
            preferredModes.length === 0 ||
            preferredModes.includes(inferWorkMode(job.location));
          const salary = parseSalaryEstimate(job.salary);
          const salaryOk =
            salary === null
              ? true
              : (salaryMin === null || salary >= salaryMin) &&
                (salaryMax === null || salary <= salaryMax);

          return typeOk && modeOk && salaryOk;
        })
      : jobs;

  const handleSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (search) next.set('search', search);
    else next.delete('search');
    setSearchParams(next);
  };

  const handleFilterChange = (filter) => {
    if (!filter.value && !filter.location) {
      setActiveFilter('all');
    } else if (filter.location) {
      setActiveFilter(`loc:${filter.value}`);
    } else {
      setActiveFilter(`type:${filter.value}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Browse Jobs</h1>
      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search jobs, companies..."
          className="w-full max-w-md bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-blue-primary"
        />
      </form>
      <div className="mb-6">
        <JobFilter
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
      </div>

      {user && hasPreferenceData && (
        <div className="mb-6 bg-bg-card border border-border rounded-card p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-text-primary font-medium">
              Use my profile preferences
            </p>
            <p className="text-text-muted text-sm">
              Applies your preferred job type, work mode, and salary range.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUsePreferences((prev) => !prev)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              usePreferences
                ? 'bg-blue-primary text-white'
                : 'bg-bg-secondary border border-border text-text-secondary'
            }`}
          >
            {usePreferences ? 'Preferences On' : 'Preferences Off'}
          </button>
        </div>
      )}

      {user && recommendedJobs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-3">
            Recommended for you
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedJobs.map((job) => (
              <JobCard
                key={`recommended-${job.id}`}
                job={job}
                savedJobIds={savedJobIds}
                onSaved={(id) => setSavedJobsIds((prev) => [...prev, id])}
              />
            ))}
          </div>
        </div>
      )}
      {loading ? (
        <p className="text-text-muted text-center py-12">Loading jobs...</p>
      ) : jobsToRender.length === 0 ? (
        <p className="text-text-muted text-center py-12">No jobs found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobsToRender.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              savedJobIds={savedJobIds}
              onSaved={(id) => setSavedJobsIds((prev) => [...prev, id])}
            />
          ))}
        </div>
      )}
    </div>
  );
}
