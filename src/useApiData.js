import { useCallback, useEffect, useState } from 'react';
import { getCached, fetchData } from './dataCache';

export default function useApiData(key, url, { pollMs = 0 } = {}) {
  const cached = getCached(key);

  const [data, setData] = useState(cached ?? null);
  const [loading, setLoading] = useState(cached === undefined);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);

  // Ipinapakita agad ang cache, pero laging kumukuha ng bagong data sa background
  useEffect(() => {
    let active = true;

    fetchData(key, url, { force: true })
      .then((result) => {
        if (active) {
          setData(result);
          setError('');
        }
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.error || err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [key, url, tick]);

  // Auto refresh kapag bumalik ka sa tab
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible') {
        setTick((t) => t + 1);
      }
    }
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  // Opsyonal: tuloy-tuloy na refresh kada X milliseconds (hal. 30000)
  useEffect(() => {
    if (!pollMs) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), pollMs);
    return () => clearInterval(id);
  }, [pollMs]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { data, loading, error, reload };
}