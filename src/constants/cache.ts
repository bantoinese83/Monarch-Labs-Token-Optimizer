// Cache configuration constants
export const CACHE_CONFIG = {
  DEFAULT_TTL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  COMPARISON_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days for comparison results
  TOKEN_COUNT_TTL: 24 * 60 * 60 * 1000, // 24 hours for token counts
  MAX_SIZE: {
    COMPARISON: 30,
    TOKEN_COUNT: 100,
  },
  STORAGE_KEYS: {
    COMPARISON: 'monarch-labs-comparison-cache',
    TOKEN_COUNT: 'monarch-labs-token-count-cache',
  },
} as const;
