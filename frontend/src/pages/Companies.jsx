import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listCompanies } from '../api/companies.api';
import SectionHeading from '../components/SectionHeading';
import EmptyState from '../components/EmptyState';
import CompanyCardSkeletonGrid from '../components/skeletons/CompanyCardSkeleton';

function formatWebsite(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCompanies()
      .then((res) => setCompanies(res.data.companies ?? []))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="border-b border-border bg-bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
          <SectionHeading
            headingTag="h1"
            className="mb-0"
            overline="Employers"
            title="Companies"
            description="Browse organizations with active roles on Jobify — open a company to see all their listings."
          />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <CompanyCardSkeletonGrid count={6} />
        ) : companies.length === 0 ? (
          <EmptyState
            icon="🏢"
            title="No employer profiles yet"
            description="Companies appear when we can identify a real employer name on active job listings."
          >
            <Link
              to="/jobs"
              className="rounded-xl border border-blue-primary bg-blue-primary/10 px-4 py-2 text-sm font-medium text-blue-text hover:bg-blue-primary/20"
            >
              Browse jobs
            </Link>
          </EmptyState>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => (
              <li key={c.slug}>
                <Link
                  to={`/companies/${c.slug}`}
                  className="flex h-full flex-col rounded-xl border border-border bg-bg-card p-4 shadow-sm transition-colors hover:border-border-hover hover:bg-bg-hover"
                >
                  <span className="font-semibold text-text-primary line-clamp-2">
                    {c.name}
                  </span>
                  <span className="mt-1 text-sm text-text-secondary">
                    {c.openJobCount} open {c.openJobCount === 1 ? 'job' : 'jobs'}
                  </span>
                  {c.website && (
                    <span className="mt-2 text-xs text-text-muted truncate">
                      {formatWebsite(c.website)}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}