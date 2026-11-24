const TABS = [
  { id: 'career', label: 'Career Profile' },
  { id: 'preferences', label: 'Job Preferences' },
  { id: 'security', label: 'Account Security' },
];

function tabClass(active) {
  return active
    ? 'border border-blue-primary/25 bg-blue-light text-blue-text font-semibold'
    : 'border border-border bg-bg-card text-text-secondary hover:bg-bg-hover hover:text-text-primary';
}

export function ProfileTabNav({ activeTab, setActiveTab }) {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveTab(tab.id)}
          className={`rounded-full px-4 py-2 text-sm transition-all ${tabClass(activeTab === tab.id)}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function ProfileLayoutFrame({ activeTab, setActiveTab, children }) {
  return (
    <>
      <ProfileTabNav activeTab={activeTab} setActiveTab={setActiveTab} />
      {children}
    </>
  );
}