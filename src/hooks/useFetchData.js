import { useState, useEffect, useRef } from 'react';
import { dataCache } from '../utils/cache';

// In-flight request deduplication: prevents multiple components from
// firing the same API call simultaneously when cache is empty.
const inFlight = new Map();

export function useFetchData(key, fetchFn, dependencies = []) {
  const [data, setData] = useState(() => dataCache.get(key));
  const [loading, setLoading] = useState(() => !dataCache.get(key));
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    const cached = dataCache.get(key);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    // Reuse in-flight promise if another component already requested this key
    if (!inFlight.has(key)) {
      inFlight.set(key, fetchFn().then(r => r.data || r));
    }

    setLoading(true);
    inFlight.get(key)
      .then(responseData => {
        dataCache.set(key, responseData);
        inFlight.delete(key);
        if (mountedRef.current) {
          setData(responseData);
          setError(null);
          setLoading(false);
        }
      })
      .catch(err => {
        inFlight.delete(key);
        if (mountedRef.current) {
          console.error(`Error fetching ${key}:`, err);
          setError(err.message || 'Failed to load data');
          setLoading(false);
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ...dependencies]);

  return { data, loading, error };
}
