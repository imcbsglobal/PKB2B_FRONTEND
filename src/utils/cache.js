/**
 * Simple in-memory cache for API responses
 * Prevents redundant API calls within a time window
 */

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class DataCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;

    // Check if cache expired
    if (Date.now() - item.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  has(key) {
    const item = this.cache.get(key);
    return item !== null;
  }
}

export const dataCache = new DataCache();
