// Storage keys
export const STORAGE_KEYS = {
  HISTORY: 'monarch-labs-token-optimizer-history',
  LOADER_TYPE: 'monarch-labs-loader-type',
} as const;

// Storage size limits (in bytes)
export const STORAGE_LIMITS = {
  MAX_HISTORY_ITEMS: 100,
  MAX_ITEM_SIZE: 5 * 1024 * 1024, // 5MB per item
  MAX_TOTAL_SIZE: 10 * 1024 * 1024, // 10MB total
} as const;

// Storage cleanup thresholds
export const STORAGE_CLEANUP = {
  PRUNING_RATIO: 0.8, // Keep 80% when pruning
  AGGRESSIVE_PRUNING_RATIO: 0.7, // Keep 70% when quota exceeded
} as const;
