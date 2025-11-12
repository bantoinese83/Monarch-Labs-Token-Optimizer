import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type { ComparisonResult, AppState } from '@/types';
import { getFormatComparisons } from '@/services/geminiService';
import { analyzeTokens } from '@/utils/tokenizer';
import { GeminiServiceError } from '@/errors/AppError';
import { API_TIMEOUTS, API_ERROR_MESSAGES } from '@/constants';
import { comparisonCache, hashString } from '@/services/cache';

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_RESULT'; payload: ComparisonResult }
  | { type: 'RESET' };

const initialState: AppState = {
  comparisonResult: null,
  isLoading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_RESULT':
      return { ...state, comparisonResult: action.payload, error: null };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface AppContextValue extends AppState {
  compareFormats: (inputText: string) => Promise<void>;
  reset: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const compareFormats = useCallback(async (inputText: string) => {
    if (!inputText.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter a description of the data.' });
      return;
    }

    // Check cache first
    const cacheKey = hashString(inputText.trim());
    const cached = comparisonCache.get(cacheKey) as ComparisonResult | null;

    if (cached) {
      dispatch({ type: 'SET_RESULT', payload: cached });
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    let timeoutId: NodeJS.Timeout | null = null;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(API_ERROR_MESSAGES.TIMEOUT));
        }, API_TIMEOUTS.REQUEST_TIMEOUT);
      });

      const codeResult = await Promise.race([getFormatComparisons(inputText), timeoutPromise]);

      // Clear timeout if request succeeded
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const fullResult: ComparisonResult = {
        json: {
          code: codeResult.json.code,
          token_breakdown: analyzeTokens(codeResult.json.code),
        },
        csv: {
          code: codeResult.csv.code,
          token_breakdown: analyzeTokens(codeResult.csv.code),
        },
        toon: {
          code: codeResult.toon.code,
          token_breakdown: analyzeTokens(codeResult.toon.code),
        },
        yaml: {
          code: codeResult.yaml.code,
          token_breakdown: analyzeTokens(codeResult.yaml.code),
        },
      };

      // Cache the result
      comparisonCache.set(cacheKey, fullResult);

      dispatch({ type: 'SET_RESULT', payload: fullResult });
    } catch (error) {
      // Clean up timeout on error
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      let message: string;

      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('Request timeout')) {
          message = API_ERROR_MESSAGES.TIMEOUT;
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          message = API_ERROR_MESSAGES.NETWORK_ERROR;
        } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
          message = API_ERROR_MESSAGES.RATE_LIMIT;
        } else if (error instanceof GeminiServiceError) {
          message = error.message;
        } else if (error.message.includes('parse') || error.message.includes('JSON')) {
          message = 'Failed to process the data description. Please try rephrasing or providing more details.';
        } else if (error.message.includes('Missing') || error.message.includes('empty')) {
          message = 'The AI response was incomplete. Please try again with a clearer description.';
        } else {
          message = API_ERROR_MESSAGES.GENERIC_ERROR;
        }
      } else {
        message = API_ERROR_MESSAGES.UNEXPECTED_ERROR;
      }

      dispatch({ type: 'SET_ERROR', payload: message });
      console.error('Comparison error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value: AppContextValue = {
    ...state,
    compareFormats,
    reset,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
