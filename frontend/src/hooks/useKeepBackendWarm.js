/**
 * Pings the Render backend while this tab is open so the free tier does not sleep
 * and missed hourly scraper runs are less likely. Does not run against localhost.
 *
 * Optional Vercel env: VITE_BACKEND_PING_MS (default 14 minutes).
 * Render sleeps after ~15 minutes with no inbound HTTP traffic.
 */

import { useEffect } from 'react';
import api from '../api/axios';

const DEFAULT_PING_MS = 14 * 60 * 1000;

function isProductionApiBase() {
  const base = import.meta.env.VITE_API_URL || '';
  return base.startsWith('https://') && !base.includes('localhost');
}

export function useKeepBackendWarm() {
  useEffect(() => {
    if (import.meta.env.VITE_BACKEND_PING === 'false') return;
    if (!isProductionApiBase()) return;

    const intervalMs = Number(import.meta.env.VITE_BACKEND_PING_MS) || DEFAULT_PING_MS;

    const ping = () => {
      api.get('/api/health').catch(() => {});
    };

    ping();
    const id = setInterval(ping, intervalMs);

    const onVisible = () => {
      if (document.visibilityState === 'visible') ping();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}
