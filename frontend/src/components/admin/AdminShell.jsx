import SectionHeading from '../SectionHeading';

const TABS = [
  { id: 'stats', label: 'Stats' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'users', label: 'Users' },
  { id: 'scraper', label: 'Scraper' },
];

export function AdminTabNav({ tab, setTab }) {
  return (
    <div className="mb-8 flex flex-wrap gap-1 rounded-2xl border border-border bg-bg-secondary p-1">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setTab(t.id)}
          className={`min-w-[calc(50%-0.25rem)] flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-medium capitalize transition-all sm:min-w-0 ${
            tab === t.id
              ? 'bg-bg-card text-blue-text shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function AdminLayoutFrame({ tab, setTab, children }) {
  return (
    <>
      <AdminTabNav tab={tab} setTab={setTab} />
      {children}
    </>
  );
}

export function AdminStudioHeader() {
  return (
    <section className="border-b border-border bg-bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <SectionHeading
          headingTag="h1"
          className="mb-0"
          overline="Operations"
          title="Admin dashboard"
          description="Platform stats, job and user management, and scraper controls."
        />
      </div>
    </section>
  );
}