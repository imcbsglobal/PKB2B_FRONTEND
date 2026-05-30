import { useCallback, useRef } from 'react';

/**
 * Hook for caching barcode search results
 * Avoids duplicate API calls for the same barcode
 * Maintains cache across component lifecycle
 */
export const useBarcodeCache = () => {
  const cacheRef = useRef(new Map());

  const getFromCache = useCallback((barcode) => {
    const normalized = String(barcode || '').trim();
    return cacheRef.current.get(normalized) || null;
  }, []);

  const setInCache = useCallback((barcode, data) => {
    const normalized = String(barcode || '').trim();
    cacheRef.current.set(normalized, data);
  }, []);

  const isCached = useCallback((barcode) => {
    const normalized = String(barcode || '').trim();
    return cacheRef.current.has(normalized);
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const getCacheSize = useCallback(() => {
    return cacheRef.current.size;
  }, []);

  return {
    getFromCache,
    setInCache,
    isCached,
    clearCache,
    getCacheSize,
  };
};
