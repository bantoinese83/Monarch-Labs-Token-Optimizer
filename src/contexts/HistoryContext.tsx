import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { SavedComparison, ComparisonResult } from '@/types';
import {
  getHistory,
  saveComparison,
  deleteComparison,
  updateComparison,
  searchHistory,
  clearHistory,
} from '@/services/historyService';

interface HistoryContextValue {
  history: SavedComparison[];
  selectedComparisons: string[];
  loadHistory: () => void;
  saveToHistory: (
    inputText: string,
    result: ComparisonResult,
    tags?: string[],
    notes?: string
  ) => boolean;
  removeFromHistory: (id: string) => boolean;
  updateHistoryItem: (
    id: string,
    updates: Partial<Pick<SavedComparison, 'tags' | 'notes'>>
  ) => boolean;
  search: (query: string) => SavedComparison[];
  clear: () => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
}

const HistoryContext = createContext<HistoryContextValue | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<SavedComparison[]>([]);
  const [selectedComparisons, setSelectedComparisons] = useState<string[]>([]);

  const loadHistory = useCallback(() => {
    setHistory(getHistory());
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const saveToHistory = useCallback(
    (inputText: string, result: ComparisonResult, tags?: string[], notes?: string): boolean => {
      try {
        const saved = saveComparison(inputText, result, tags, notes);
        if (saved) {
          loadHistory();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error in saveToHistory:', error);
        return false;
      }
    },
    [loadHistory]
  );

  const removeFromHistory = useCallback(
    (id: string): boolean => {
      try {
        const deleted = deleteComparison(id);
        if (deleted) {
          loadHistory();
          setSelectedComparisons(prev => prev.filter(selectedId => selectedId !== id));
        }
        return deleted;
      } catch (error) {
        console.error('Error in removeFromHistory:', error);
        return false;
      }
    },
    [loadHistory]
  );

  const updateHistoryItem = useCallback(
    (id: string, updates: Partial<Pick<SavedComparison, 'tags' | 'notes'>>): boolean => {
      try {
        const updated = updateComparison(id, updates);
        if (updated) {
          loadHistory();
        }
        return updated;
      } catch (error) {
        console.error('Error in updateHistoryItem:', error);
        return false;
      }
    },
    [loadHistory]
  );

  const search = useCallback((query: string) => {
    return searchHistory(query);
  }, []);

  const clear = useCallback(() => {
    clearHistory();
    loadHistory();
    setSelectedComparisons([]);
  }, [loadHistory]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedComparisons(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedComparisons([]);
  }, []);

  return (
    <HistoryContext.Provider
      value={{
        history,
        selectedComparisons,
        loadHistory,
        saveToHistory,
        removeFromHistory,
        updateHistoryItem,
        search,
        clear,
        toggleSelection,
        clearSelection,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
