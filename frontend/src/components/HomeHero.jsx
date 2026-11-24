/**
 * Home page hero — copy + search with a light product mock on the right.
 */
import { Link } from 'react-router-dom';

const subtitle =
  'Search fresh job listings in one place, move every application through your tracker, and see how well you match with AI resume scoring.';

function HeroProductMock() {
  return (
    <div
      className="hero-product-mock relative w-full max-w-[340px] mx-auto lg:ml-auto lg:mr-0"
      aria-hidden
    >
      <div className="rounded-2xl border border-border bg-bg-card p-4 shadow-lg">
        <div className="flex items-center gap-1.5 mb-4">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#4ade80]/80" />
        </div>
        <div className="flex gap-2 rounded-xl bg-bg-secondary border border-border p-1.5 mb-4">
          <div className="flex-1 rounded-lg bg-bg-card px-3 py-2 text-xs text-text-muted">
            Search roles, companies…
          </div>
          <div className="rounded-lg bg-blue-primary px-3 py-2 text-xs font-semibold text-white">Go</div>
        </div>
        <div className="space-y-2.5">
          {[0.85, 0.65, 0.75].map((w, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-bg-secondary/80 px-3 py-3 flex items-center gap-3"
            >
              <div className="h-9 w-9 shrink-0 rounded-lg bg-blue-light" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="h-2.5 rounded-full bg-border" style={{ width: `${w * 100}%` }} />
                <div className="h-2 rounded-full bg-border/70 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -z-10 -right-6 -bottom-6 h-full w-full rounded-2xl bg-gradient-to-br from-[#5eb8c9]/35 via-[#076682]/20 to-transparent blur-[2px]" />
    </div>
  );
}

export default function HomeHero({ search, setSearch, onSubmit, stats }) {
  const metrics = [
    { value: stats.totalJobs, label: 'Open jobs' },
    { value: stats.companiesTracked, label: 'Companies' },
    { value: stats.jobSeekers, label: 'Job seekers' },
  ];

  return (
    <section className="hero-shell border-b border-border overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="hero-blob-a" />
        <div className="hero-blob-b" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-12 md:pt-16 md:pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left order-2 lg:order-1">
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.2em] bg-blue-light text-blue-text mb-5">
              Jobs · Tracker · AI resume
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-[3.15rem] font-extrabold tracking-tight text-text-primary leading-[1.1]">
              Find your next job,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#076682] via-[#0a849e] to-[#5eb8c9]">
                faster
              </span>{' '}
              than ever
            </h1>
            <p className="mt-4 text-text-secondary text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {subtitle}
            </p>

            <form
              onSubmit={onSubmit}
              className="hero-search-bar mt-8 flex flex-col sm:flex-row gap-2 sm:gap-0 sm:p-1.5 bg-bg-card rounded-2xl max-w-xl mx-auto lg:mx-0"
            >
              <input
                type="text"
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

            <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm font-medium">
              <Link to="/jobs" className="text-blue-text hover:underline">
                Browse all jobs →
              </Link>
              <Link to="/resume" className="text-text-secondary hover:text-blue-text transition-colors">
                Score your resume
              </Link>
            </div>

            <dl className="mt-10 pt-8 border-t border-border grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 lg:max-w-none">
              {metrics.map(({ value, label }) => (
                <div key={label} className="text-center lg:text-left">
                  <dd className="text-2xl md:text-3xl font-bold tabular-nums text-blue-text">{value}</dd>
                  <dt className="text-xs sm:text-sm text-text-secondary mt-0.5">{label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <HeroProductMock />
          </div>
        </div>
      </div>
    </section>
  );
}