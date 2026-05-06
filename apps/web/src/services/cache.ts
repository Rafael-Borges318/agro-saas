interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private inflight = new Map<string, Promise<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  /**
   * Deduplicates concurrent requests for the same key.
   * If a fetch is already in-flight, returns the same promise.
   * On resolution, caches the result and clears the in-flight entry.
   */
  async dedupe<T>(key: string, fn: () => Promise<T>, ttlMs: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;

    const existing = this.inflight.get(key) as Promise<T> | undefined;
    if (existing) return existing;

    const promise = fn().then((result) => {
      this.set(key, result, ttlMs);
      this.inflight.delete(key);
      return result;
    }).catch((err) => {
      this.inflight.delete(key);
      throw err;
    });

    this.inflight.set(key, promise as Promise<unknown>);
    return promise;
  }
}

export const cache = new MemoryCache();

export const TTL = {
  CLIMATE_CURRENT:  10 * 60 * 1000,  // 10 min
  CLIMATE_FORECAST: 10 * 60 * 1000,  // 10 min
  CLIMATE_MONTHLY:  60 * 60 * 1000,  // 1 hour (historical — rarely changes)
  PRICES:           24 * 60 * 60 * 1000, // 24 hours
  FINANCIAL:         5 * 60 * 1000,  // 5 min
  ADMIN:             2 * 60 * 1000,  // 2 min
};
