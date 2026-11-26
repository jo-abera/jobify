import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listCompanies } from '../api/companies.api';
import SectionHeading from '../components/SectionHeading';

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
          <p className="text-center text-text-muted py-12">Loading companies…</p>
        ) : companies.length === 0 ? (
          <p className="text-center text-text-muted py-12">No companies with open jobs yet.</p>
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