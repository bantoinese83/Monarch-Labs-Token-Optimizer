import type { SavedComparison, ComparisonResult } from '@/types';
import { STORAGE_KEYS, STORAGE_LIMITS, STORAGE_CLEANUP } from '@/constants';

function isQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.code === 22 ||
      error.code === 1014 ||
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}

function getStorageSize(key: string): number {
  try {
    const item = localStorage.getItem(key);
    return item ? new Blob([item]).size : 0;
  } catch {
    return 0;
  }
}

const STORAGE_KEY = STORAGE_KEYS.HISTORY;
const MAX_HISTORY_ITEMS = STORAGE_LIMITS.MAX_HISTORY_ITEMS;
const MAX_ITEM_SIZE = STORAGE_LIMITS.MAX_ITEM_SIZE;
const MAX_TOTAL_SIZE = STORAGE_LIMITS.MAX_TOTAL_SIZE;

function getTotalStorageSize(): number {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        total += getStorageSize(key);
      }
    }
    return total;
  } catch {
    return 0;
  }
}

function validateSavedComparison(data: unknown): data is SavedComparison {
  if (!data || typeof data !== 'object') return false;
  const item = data as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.timestamp === 'number' &&
    typeof item.inputText === 'string' &&
    item.result !== null &&
    typeof item.result === 'object'
  );
}

function validateHistoryArray(data: unknown): SavedComparison[] {
  if (!Array.isArray(data)) return [];
  return data.filter(validateSavedComparison);
}

function estimateItemSize(item: SavedComparison): number {
  try {
    return new Blob([JSON.stringify(item)]).size;
  } catch {
    return 0;
  }
}

/**
 * Optimized cleanup using single pass with early termination
 * O(n log n) for sort + O(n) for iteration = O(n log n) overall
 */
function cleanupOldItems(history: SavedComparison[]): SavedComparison[] {
  // Sort by timestamp (newest first) - O(n log n)
  const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp);

  // Single pass with early termination - O(n)
  const cleaned: SavedComparison[] = [];
  let totalSize = 0;

  for (const item of sorted) {
    const itemSize = estimateItemSize(item);

    // Skip items that are too large individually
    if (itemSize > MAX_ITEM_SIZE) {
      console.warn('Skipping history item that exceeds size limit:', item.id);
      continue;
    }

    // Early termination when size limit reached
    if (totalSize + itemSize > MAX_TOTAL_SIZE && cleaned.length > 0) {
      break;
    }

    // Early termination when item limit reached
    if (cleaned.length >= MAX_HISTORY_ITEMS) {
      break;
    }

    cleaned.push(item);
    totalSize += itemSize;
  }

  return cleaned;
}

/**
 * Optimized deduplication using Map for O(1) lookups
 * O(n) time complexity instead of O(n²) with array.includes()
 */
function deduplicateHistory(history: SavedComparison[]): SavedComparison[] {
  const seen = new Map<string, SavedComparison>();

  // Single pass deduplication - O(n)
  for (const item of history) {
    const key = item.inputText.trim().toLowerCase();
    const existing = seen.get(key);

    // Keep the most recent version
    if (!existing || item.timestamp > existing.timestamp) {
      seen.set(key, item);
    }
  }

  // Convert to array and sort - O(n log n)
  return Array.from(seen.values()).sort((a, b) => b.timestamp - a.timestamp);
}

export function saveComparison(
  inputText: string,
  result: ComparisonResult,
  tags?: string[],
  notes?: string
): SavedComparison | null {
  try {
    const saved: SavedComparison = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      inputText: inputText.trim(),
      result,
      tags: tags?.filter(Boolean),
      notes: notes?.trim() || undefined,
    };

    // Validate input
    if (!saved.inputText || saved.inputText.length === 0) {
      console.error('Cannot save comparison: input text is empty');
      return null;
    }

    // Check item size
    const itemSize = estimateItemSize(saved);
    if (itemSize > MAX_ITEM_SIZE) {
      console.error('Cannot save comparison: item exceeds size limit');
      return null;
    }

    // Load existing history
    let history = getHistory();

    // Optimized: Combine deduplication and filtering in single pass
    const normalizedInput = saved.inputText.trim().toLowerCase();
    const deduplicatedMap = new Map<string, SavedComparison>();

    // Build deduplicated map while filtering out matching input
    for (const item of history) {
      const key = item.inputText.trim().toLowerCase();
      // Skip if it matches the new item's input
      if (key === normalizedInput) {
        continue;
      }
      // Keep most recent version
      const existing = deduplicatedMap.get(key);
      if (!existing || item.timestamp > existing.timestamp) {
        deduplicatedMap.set(key, item);
      }
    }

    // Convert to array, add new item, then cleanup
    history = Array.from(deduplicatedMap.values());
    history.unshift(saved);
    history = cleanupOldItems(history);

    // Try to save with error handling
    try {
      const serialized = JSON.stringify(history);
      const serializedSize = new Blob([serialized]).size;

      // Check if we have enough space
      const currentTotal = getTotalStorageSize();
      const currentHistorySize = getStorageSize(STORAGE_KEY);
      const newTotalSize = currentTotal - currentHistorySize + serializedSize;

      if (newTotalSize > MAX_TOTAL_SIZE) {
        // Try to free up more space
        history = cleanupOldItems(
          history.slice(0, Math.floor(history.length * STORAGE_CLEANUP.PRUNING_RATIO))
        );
        const retrySerialized = JSON.stringify(history);
        localStorage.setItem(STORAGE_KEY, retrySerialized);
        console.warn('History size limit reached, removed older items');
      } else {
        localStorage.setItem(STORAGE_KEY, serialized);
      }

      return saved;
    } catch (error) {
      if (isQuotaExceededError(error)) {
        // Try to free up space by removing older items
        console.warn('Storage quota exceeded, attempting to free space');
        history = cleanupOldItems(
          history.slice(0, Math.floor(history.length * STORAGE_CLEANUP.AGGRESSIVE_PRUNING_RATIO))
        );

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
          return saved;
        } catch (retryError) {
          console.error('Failed to save history after cleanup:', retryError);
          return null;
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Error saving comparison to history:', error);
    return null;
  }
}

export function getHistory(): SavedComparison[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    const validated = validateHistoryArray(parsed);

    // Clean up invalid items
    if (validated.length !== parsed.length) {
      console.warn(`Removed ${parsed.length - validated.length} invalid history items`);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
      } catch (error) {
        console.error('Failed to clean up invalid history items:', error);
      }
    }

    // Deduplicate and sort
    const deduplicated = deduplicateHistory(validated);

    return deduplicated;
  } catch (error) {
    console.error('Error loading history from localStorage:', error);
    // Try to recover by clearing corrupted data
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore cleanup errors
    }
    return [];
  }
}

export function getComparisonById(id: string): SavedComparison | null {
  try {
    const history = getHistory();
    // Use Map for O(1) lookup instead of O(n) array.find()
    const idMap = new Map(history.map(item => [item.id, item]));
    return idMap.get(id) || null;
  } catch (error) {
    console.error('Error getting comparison by ID:', error);
    return null;
  }
}

export function deleteComparison(id: string): boolean {
  try {
    const history = getHistory();
    const initialLength = history.length;
    // Single pass filter - O(n)
    const filtered = history.filter(item => item.id !== id);

    if (filtered.length === initialLength) {
      return false; // Item not found
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      if (isQuotaExceededError(error)) {
        console.error('Storage quota exceeded while deleting item');
        return false;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting comparison:', error);
    return false;
  }
}

export function updateComparison(
  id: string,
  updates: Partial<Pick<SavedComparison, 'tags' | 'notes'>>
): boolean {
  try {
    const history = getHistory();
    // Use Map for O(1) lookup and update
    const idMap = new Map(history.map(item => [item.id, item]));
    const existing = idMap.get(id);

    if (!existing) {
      return false;
    }

    idMap.set(id, { ...existing, ...updates });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(idMap.values())));
      return true;
    } catch (error) {
      if (isQuotaExceededError(error)) {
        console.error('Storage quota exceeded while updating item');
        return false;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error updating comparison:', error);
    return false;
  }
}

/**
 * Optimized search using Set for tag lookups
 * O(n) time complexity with early termination opportunities
 */
export function searchHistory(query: string): SavedComparison[] {
  try {
    const history = getHistory();
    if (!query.trim()) return history;

    const lowerQuery = query.toLowerCase();
    const results: SavedComparison[] = [];

    // Pre-compile query checks
    const queryInText = (text: string): boolean => {
      return text.toLowerCase().includes(lowerQuery);
    };

    // Single pass with early termination - O(n)
    for (const item of history) {
      // Check input text first (most common match)
      if (queryInText(item.inputText)) {
        results.push(item);
        continue;
      }

      // Check tags using Set for O(1) lookup
      if (item.tags && item.tags.length > 0) {
        const tagSet = new Set(item.tags.map(tag => tag.toLowerCase()));
        // Check if any tag contains query
        for (const tag of tagSet) {
          if (tag.includes(lowerQuery)) {
            results.push(item);
            break; // Found match, move to next item
          }
        }
        if (results[results.length - 1] === item) continue; // Already added
      }

      // Check notes last (least common)
      if (item.notes && queryInText(item.notes)) {
        results.push(item);
      }
    }

    return results;
  } catch (error) {
    console.error('Error searching history:', error);
    return [];
  }
}

export function filterByTags(tags: string[]): SavedComparison[] {
  try {
    const history = getHistory();
    if (tags.length === 0) return history;

    // Use Set for O(1) tag lookups
    const tagSet = new Set(tags.map(tag => tag.toLowerCase()));
    const results: SavedComparison[] = [];

    // Single pass filter - O(n)
    for (const item of history) {
      if (item.tags && item.tags.some(tag => tagSet.has(tag.toLowerCase()))) {
        results.push(item);
      }
    }

    return results;
  } catch (error) {
    console.error('Error filtering by tags:', error);
    return [];
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

export function getHistoryStats(): { count: number; size: number; totalSize: number } {
  try {
    const history = getHistory();
    const size = getStorageSize(STORAGE_KEY);
    const totalSize = getTotalStorageSize();
    return { count: history.length, size, totalSize };
  } catch {
    return { count: 0, size: 0, totalSize: 0 };
  }
}
