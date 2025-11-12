// API timeout constants (in milliseconds)
export const API_TIMEOUTS = {
  REQUEST_TIMEOUT: 60000, // 60 seconds - Gemini can take longer for complex requests
} as const;

// API error messages
export const API_ERROR_MESSAGES = {
  TIMEOUT: 'Request timeout. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  RATE_LIMIT: 'API rate limit exceeded. Please wait a moment and try again.',
  GENERIC_ERROR:
    'Failed to get comparison. The model may not be able to process the request. Please try again with a different description.',
  UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

// Gemini API configuration
export const GEMINI_CONFIG = {
  MODEL: 'gemini-2.5-flash',
  TEMPERATURE: 0.1,
} as const;
