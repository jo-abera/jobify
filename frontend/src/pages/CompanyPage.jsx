import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCompanyBySlug } from '../api/companies.api';
import { getSavedJobs } from '../api/tracker.api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import SectionHeading from '../components/SectionHeading';
import EmptyState from '../components/EmptyState';
import JobCardSkeletonGrid from '../components/skeletons/JobCardSkeleton';

function formatWebsite(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default function CompanyPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState([]);

  useEffect(() => {
    setLoading(true);
    getCompanyBySlug(slug)
      .then((res) => {
        setCompany(res.data.company);
        setJobs(res.data.jobs ?? []);
      })
      .catch(() => {
        setCompany(null);
        setJobs([]);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!user) {
      setSavedJobIds([]);
      return;
    }
    getSavedJobs()
      .then((res) => setSavedJobIds(res.data.map((s) => s.jobId)))
      .catch(() => {});
  }, [user]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <JobCardSkeletonGrid count={3} />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-text-muted">Company not found or has no active listings.</p>
        <Link to="/companies" className="mt-4 inline-block text-blue-text hover:underline">
          Browse companies
        </Link>
      </div>
    );
  }

  const siteLabel = formatWebsite(company.website);

  return (
    <div>
      <section className="border-b border-border bg-bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
          <Link
            to="/companies"
            className="mb-4 inline-block text-sm text-blue-text hover:underline"
          >
            ← All companies
          </Link>
          <SectionHeading
            headingTag="h1"
            className="mb-0"
            overline="Company"
            title={company.name}
            description={company.description}
          />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 space-y-10">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div className="rounded-2xl border border-border bg-bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-text-primary">About</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {company.description}
            </p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {company.headquarters && (
                <div>
                  <dt className="text-[0.65rem] font-bold uppercase tracking-wider text-text-muted">
                    Headquarters
                  </dt>
                  <dd className="mt-0.5 text-sm text-text-primary">{company.headquarters}</dd>
                </div>
              )}
              {company.locations?.length > 0 && (
                <div>
                  <dt className="text-[0.65rem] font-bold uppercase tracking-wider text-text-muted">
                    Hiring in
                  </dt>
                  <dd className="mt-0.5 text-sm text-text-primary">
                    {company.locations.slice(0, 5).join(' · ')}
                    {company.locations.length > 5 ? ' …' : ''}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-[0.65rem] font-bold uppercase tracking-wider text-text-muted">
                  Open roles
                </dt>
                <dd className="mt-0.5 text-sm font-semibold tabular-nums text-blue-text">
                  {company.openJobCount}
                </dd>
              </div>
            </dl>
          </div>

          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-wrap items-center justify-center rounded-xl border border-border bg-bg-card px-6 py-4 text-sm font-semibold text-blue-text shadow-sm transition-colors hover:bg-bg-hover"
            >
              Visit website
              {siteLabel ? (
                <span className="ml-2 text-text-muted font-normal">({siteLabel})</span>
              ) : null}
            </a>
          )}
        </div>

        <section>
          <h2 className="text-lg font-bold text-text-primary mb-4">Open jobs</h2>
          {jobs.length === 0 ? (
            <EmptyState
              compact
              icon="—"
              title="No open roles"
              description="This employer has no active listings on Jobify right now."
            >
              <Link
                to="/companies"
                className="text-xs font-medium text-blue-text hover:underline"
              >
                Browse other companies
              </Link>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        </section>
      </div>
    </div>
  );
}