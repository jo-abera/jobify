/**
 * Job browse page with search and filters.
 *
 * URL search params (?search=) sync with the search input. JobFilter drives
 * type/location query params on GET /api/jobs. Logged-in users load saved
 * job IDs to show Save state on JobCard.
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getJobs } from '../api/jobs.api';
import { getSavedJobs } from '../api/tracker.api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import JobFilter from '../components/JobFilter';
import JobCategoryFilter from '../components/JobCategoryFilter';
import JobFiltersPanel from '../components/JobFiltersPanel';
import SectionHeading from '../components/SectionHeading';
import JobPagination from '../components/JobPagination';
import {
  apiParamsFromSearchParams,
  setFilterParam,
  clearFilterParams,
  JOB_FILTER_PARAM_KEYS,
} from '../utils/jobListQuery';

const PAGE_SIZE = 15;

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

function jobWorkMode(job) {
  if (job.workMode) return job.workMode;
  const value = (job.location || '').toLowerCase();
  if (value.includes('remote')) return 'Remote';
  if (value.includes('hybrid')) return 'Hybrid';
  return 'On-site';
}

function normalizeJobsPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.jobs)) return payload.jobs;
  return [];
}

/** Pulls the pagination envelope out of a paginated response, with safe defaults. */
function normalizePagination(payload, fallbackPage) {
  const p = payload && payload.pagination;
  if (!p) {
    return {
      total: 0,
      page: fallbackPage,
      limit: PAGE_SIZE,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    };
  }
  return p;
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
  const salaryMin = user.salaryExpectationMin ?? null; // ??(nullish coalescing) means "use the right-hand side if the left-hand side is null or undefined"
  const salaryMax = user.salaryExpectationMax ?? null;

  let score = 0;
  const corpus = `${job.title} ${job.company} ${job.description}`.toLowerCase();

  if (preferredTypes.length > 0 && preferredTypes.includes(job.type))
    score += 25;
  if (preferredModes.length > 0 && preferredModes.includes(jobWorkMode(job)))
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
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [page, setPage] = useState(1);
  const [catalogJobs, setCatalogJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const activeCategory = searchParams.get('category') || '';
  const [usePreferences, setUsePreferences] = useState(false);
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
    const params = apiParamsFromSearchParams(searchParams, {
      page,
      limit: PAGE_SIZE,
    });

    getJobs(params)
      .then((res) => {
        setJobs(normalizeJobsPayload(res.data));
        setPagination(normalizePagination(res.data, page));
      })
      .catch(() => {
        setJobs([]);
        setPagination({
          total: 0,
          page: 1,
          limit: PAGE_SIZE,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        });
      })
      .finally(() => setLoading(false));
  };

  const fetchCatalogJobs = () => {
    const params = apiParamsFromSearchParams(searchParams, { limit: 100 });

    getJobs(params)
      .then((res) => setCatalogJobs(normalizeJobsPayload(res.data)))
      .catch(() => setCatalogJobs([]));
  };

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  // Reset to page 1 whenever the search or filter changes, so we don't get
  // stranded on e.g. page 5 of a now-different result set.
  useEffect(() => {
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    fetchJobs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, page]);

  useEffect(() => {
    fetchCatalogJobs();
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      getSavedJobs()
        .then((res) =>
          setSavedJobIds(
            Array.isArray(res.data) ? res.data.map((s) => s.jobId) : []
          )
        )
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
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

  const jobsToRender = Array.isArray(jobs)
    ? usePreferences && hasPreferenceData
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
            preferredModes.includes(jobWorkMode(job));
          const salary = parseSalaryEstimate(job.salary);
          const salaryOk =
            salary === null
              ? true
              : (salaryMin === null || salary >= salaryMin) &&
                (salaryMax === null || salary <= salaryMax);

          return typeOk && modeOk && salaryOk;
        })
      : jobs
    : [];

  const handleSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (search) next.set('search', search);
    else next.delete('search');
    setSearchParams(next);
  };

  const handleFilterParam = (key, value) => {
    setSearchParams(setFilterParam(searchParams, key, value));
  };

  const handleCategoryChange = (category) => {
    handleFilterParam('category', category);
  };

  const filterValues = {
    category: searchParams.get('category') || '',
    workMode: searchParams.get('workMode') || '',
    experienceLevel: searchParams.get('experienceLevel') || '',
    postedWithin: searchParams.get('postedWithin') || '',
    sourceSite: searchParams.get('sourceSite') || '',
  };

  const hasActiveFilters = JOB_FILTER_PARAM_KEYS.some(
    (key) => key !== 'search' && Boolean(searchParams.get(key))
  );

  return (
    <div>
      <section className="border-b border-border bg-bg-secondary/40">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
          <SectionHeading
            headingTag="h1"
            className="mb-8"
            overline="Job board"
            title="Browse jobs"
            description="Search by title or company, then refine with categories, work mode, experience, date, and source."
            trailing={
              !loading && pagination.total > 0 ? (
                <p className="rounded-lg border border-border bg-bg-card px-4 py-2.5 text-sm font-semibold text-blue-text tabular-nums shrink-0">
                  {pagination.total} {pagination.total === 1 ? 'role' : 'roles'}
                </p>
              ) : null
            }
          />

          <form
            onSubmit={handleSearch}
            className="hero-search-bar flex flex-col sm:flex-row gap-2 sm:gap-0 sm:p-1.5 bg-bg-card rounded-2xl max-w-2xl"
          >
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, companies..."
              className="flex-1 bg-bg-secondary sm:bg-transparent border border-border sm:border-0 rounded-xl sm:rounded-2xl px-4 py-3.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-0 focus:border-border-hover"
            />
            <button
              type="submit"
              className="btn-brand text-white px-6 py-3.5 rounded-xl font-semibold transition-all shrink-0"
            >
              Search
            </button>
          </form>

        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 lg:hidden">
          <div className="mb-4 sticky top-16 z-10 -mx-4 px-4 py-3 bg-bg-primary/95 backdrop-blur-sm border-b border-border">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-text-muted">
              Browse by category
            </p>
            {filterValues.category && !loading && (
              <button
                type="button"
                onClick={() => handleCategoryChange('')}
                className="text-xs font-medium text-blue-text hover:underline"
              >
                Clear category
              </button>
            )}
          </div>
          <JobCategoryFilter
            value={filterValues.category}
            onChange={handleCategoryChange}
          />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(15rem,17rem)_minmax(0,1fr)]">
          <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <JobFiltersPanel
              filters={filterValues}
              onChange={handleFilterParam}
              onClearAll={() => setSearchParams(clearFilterParams(searchParams))}
              showClear={hasActiveFilters}
            />
            <div className="rounded-card border border-border bg-bg-card p-4 md:p-5">
              <p className="text-sm font-semibold text-text-primary mb-3">
                Employment type
              </p>
              <JobFilter
                vertical
                activeType={searchParams.get('type') || ''}
                onTypeChange={(type) => handleFilterParam('type', type)}
              />
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-6 hidden lg:block">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-text-muted">
                  Browse by category
                </p>
                {filterValues.category && !loading && (
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('')}
                    className="text-xs font-medium text-blue-text hover:underline"
                  >
                    Clear category
                  </button>
                )}
              </div>
              <JobCategoryFilter
                value={filterValues.category}
                onChange={handleCategoryChange}
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
                onSaved={(id) => setSavedJobIds((prev) => [...prev, id])}
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobsToRender.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                savedJobIds={savedJobIds}
                onSaved={(id) => setSavedJobIds((prev) => [...prev, id])}
              />
            ))}
          </div>

          <JobPagination
            pagination={pagination}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}
          </div>
        </div>
      </div>
    </div>
  );
}
