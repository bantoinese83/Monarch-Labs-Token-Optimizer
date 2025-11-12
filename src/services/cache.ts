import { CACHE_CONFIG } from '@/constants';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  defaultTTL?: number;
  maxSize?: number;
  storageKey?: string;
}

const DEFAULT_CONFIG: Required<CacheConfig> = {
  defaultTTL: CACHE_CONFIG.DEFAULT_TTL,
  maxSize: 50, // Maximum number of entries
  storageKey: 'monarch-labs-cache',
};

class SimpleCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private config: Required<CacheConfig>;
  // Maintain sorted keys by timestamp for O(1) oldest key lookup
  private oldestKey: string | null = null;
  private oldestTimestamp: number = Infinity;

  constructor(config: CacheConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadFromStorage();
  }

  /**
   * Get a value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      // Entry expired
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    return entry.data;
  }

  /**
   * Set a value in cache
   */
  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: now,
      ttl: ttl ?? this.config.defaultTTL,
    };

    // Enforce max size by removing oldest entries
    if (this.cache.size >= this.config.maxSize) {
      if (this.oldestKey) {
        this.cache.delete(this.oldestKey);
        // Reset oldest tracking
        this.updateOldestKey();
      }
    }

    this.cache.set(key, entry);

    // Update oldest key tracking
    if (now < this.oldestTimestamp) {
      this.oldestKey = key;
      this.oldestTimestamp = now;
    }

    this.saveToStorage();
  }

  /**
   * Check if a key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      this.cache.delete(key);
      this.saveToStorage();
      return false;
    }

    return true;
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      // Update oldest key if we deleted it
      if (key === this.oldestKey) {
        this.updateOldestKey();
      }
      this.saveToStorage();
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.oldestKey = null;
    this.oldestTimestamp = Infinity;
    this.saveToStorage();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    keys: string[];
    oldestEntry?: number;
    newestEntry?: number;
  } {
    const keys = Array.from(this.cache.keys());
    const timestamps = Array.from(this.cache.values()).map(entry => entry.timestamp);

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      keys,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : undefined,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : undefined,
    };
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    const now = Date.now();
    let cleaned = 0;
    const keysToDelete: string[] = [];

    // Collect expired keys first to avoid modifying during iteration
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    // Delete expired keys
    for (const key of keysToDelete) {
      this.cache.delete(key);
      cleaned++;
    }

    // Update oldest key tracking if needed
    if (cleaned > 0) {
      this.updateOldestKey();
      this.saveToStorage();
    }

    return cleaned;
  }

  /**
   * Update oldest key tracking (O(n) but only called when needed)
   */
  private updateOldestKey(): void {
    this.oldestKey = null;
    this.oldestTimestamp = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < this.oldestTimestamp) {
        this.oldestTimestamp = entry.timestamp;
        this.oldestKey = key;
      }
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as Record<string, CacheEntry<T>>;
      const now = Date.now();

      // Only load non-expired entries
      for (const [key, entry] of Object.entries(parsed)) {
        const age = now - entry.timestamp;
        if (age <= entry.ttl) {
          this.cache.set(key, entry);
          // Track oldest during load
          if (entry.timestamp < this.oldestTimestamp) {
            this.oldestTimestamp = entry.timestamp;
            this.oldestKey = key;
          }
        }
      }

      // Clean up if we loaded expired entries
      if (Object.keys(parsed).length !== this.cache.size) {
        this.saveToStorage();
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
      // Clear corrupted cache
      try {
        localStorage.removeItem(this.config.storageKey);
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    try {
      const serialized = JSON.stringify(Object.fromEntries(this.cache));
      localStorage.setItem(this.config.storageKey, serialized);
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
      // If quota exceeded, try to clean up old entries
      if (error instanceof DOMException && error.code === 22) {
        this.cleanExpired();
        // Remove oldest entries if still too large
        while (this.cache.size > this.config.maxSize * 0.5) {
          if (this.oldestKey) {
            this.cache.delete(this.oldestKey);
            this.updateOldestKey();
          } else {
            break;
          }
        }
        // Retry save
        try {
          const serialized = JSON.stringify(Object.fromEntries(this.cache));
          localStorage.setItem(this.config.storageKey, serialized);
        } catch {
          // Give up if still failing
        }
      }
    }
  }
}

// Create cache instances for different use cases
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const comparisonCache = new SimpleCache<any>({
  defaultTTL: CACHE_CONFIG.COMPARISON_TTL,
  maxSize: CACHE_CONFIG.MAX_SIZE.COMPARISON,
  storageKey: CACHE_CONFIG.STORAGE_KEYS.COMPARISON,
});

export const tokenCountCache = new SimpleCache<number>({
  defaultTTL: CACHE_CONFIG.TOKEN_COUNT_TTL,
  maxSize: CACHE_CONFIG.MAX_SIZE.TOKEN_COUNT,
  storageKey: CACHE_CONFIG.STORAGE_KEYS.TOKEN_COUNT,
});

// Export the class for custom cache instances
export { SimpleCache };

// Helper function to hash a string (simple hash for cache keys)
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}
