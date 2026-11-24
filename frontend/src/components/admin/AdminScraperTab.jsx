import { useState } from 'react';

const STORAGE_KEY = 'jobify-last-scraper-run';

const SCRAPER_CHANNELS = [
  { handle: '@josad_software', label: 'Josad Software' },
  { handle: '@freelance_ethio', label: 'Afriwork' },
  { handle: '@geezjobs_ethiopia', label: 'GeezJobs' },
  { handle: '@hahujobs', label: 'Hahu Jobs' },
  { handle: '@effoyjobs', label: 'Effoy Jobs' },
  { handle: '@addis_zemen_vacancy', label: 'Addis Zemen' },
  { handle: '@Maroset', label: 'Maroset' },
];

function formatDateTime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function RunButton({ running, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={running}
      className={`btn-brand rounded-xl px-6 py-2.5 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {running ? 'Starting scraper…' : 'Run scraper now'}
    </button>
  );
}

function StatusMessage({ message, isError }) {
  if (!message) return null;
  return (
    <p
      className={`rounded-xl border px-4 py-3 text-sm ${
        isError
          ? 'border-red-200 bg-rejected/40 text-red-800 dark:border-red-900/50 dark:text-red-300'
          : 'border-green-200 bg-offered/30 text-green-900 dark:border-green-900/40 dark:text-green-300'
      }`}
    >
      {message}
    </p>
  );
}

export default function AdminScraperTab({ onRun }) {
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [lastRun, setLastRun] = useState(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
  });

  const handleRun = async () => {
    setRunning(true);
    setMessage('');
    setIsError(false);
    try {
      const text = await onRun();
      setMessage(text);
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, now);
      setLastRun(now);
    } catch {
      setIsError(true);
      setMessage('Failed to start scraper. Check server logs and Telegram credentials.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-xl border border-border bg-bg-card p-6 text-center sm:text-left">
        <h2 className="text-lg font-semibold text-text-primary">Job scraper</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Start a background scrape; new jobs usually show up within a few minutes. The server also
          runs hourly.
        </p>
        <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:items-center">
          <RunButton running={running} onClick={handleRun} />
          {lastRun && (
            <span className="text-xs text-text-muted">Last run: {formatDateTime(lastRun)}</span>
          )}
        </div>
        {message && (
          <div className="mt-4">
            <StatusMessage message={message} isError={isError} />
          </div>
        )}
      </div>

      <details className="rounded-xl border border-border bg-bg-secondary/40 px-5 py-4">
        <summary className="cursor-pointer text-sm font-medium text-text-primary">
          Telegram sources ({SCRAPER_CHANNELS.length})
        </summary>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {SCRAPER_CHANNELS.map((ch) => (
            <li key={ch.handle} className="text-sm text-text-secondary">
              <span className="font-medium text-blue-text">{ch.handle}</span>
              <span className="text-text-muted"> · {ch.label}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}