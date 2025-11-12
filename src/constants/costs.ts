import type { APIPricing } from '@/types';

// API pricing configuration (per 1M tokens)
export const API_PRICING: Record<string, APIPricing> = {
  // OpenAI Models
  'gpt-4': {
    model: 'GPT-4',
    inputPricePer1M: 30.0,
    outputPricePer1M: 60.0,
    contextWindow: 8192,
  },
  'gpt-4-turbo': {
    model: 'GPT-4 Turbo',
    inputPricePer1M: 10.0,
    outputPricePer1M: 30.0,
    contextWindow: 128000,
  },
  'gpt-3.5-turbo': {
    model: 'GPT-3.5 Turbo',
    inputPricePer1M: 2.0, // Updated to match table: $2 per 1M tokens
    outputPricePer1M: 2.0,
    contextWindow: 16385,
  },
  'gpt-5-nano': {
    model: 'GPT-5 Nano',
    inputPricePer1M: 0.05,
    outputPricePer1M: 0.4,
    contextWindow: 32000,
  },
  // Anthropic Claude Models
  'claude-3-opus': {
    model: 'Claude 3 Opus',
    inputPricePer1M: 15.0,
    outputPricePer1M: 75.0,
    contextWindow: 200000,
  },
  'claude-3-sonnet': {
    model: 'Claude 3 Sonnet',
    inputPricePer1M: 3.0,
    outputPricePer1M: 15.0,
    contextWindow: 200000,
  },
  'claude-3-haiku': {
    model: 'Claude 3 Haiku',
    inputPricePer1M: 0.25,
    outputPricePer1M: 1.25,
    contextWindow: 200000,
  },
  // Google Gemini Models
  'gemini-pro': {
    model: 'Gemini Pro',
    inputPricePer1M: 0.5,
    outputPricePer1M: 1.5,
    contextWindow: 32768,
  },
  'gemini-2.5-pro': {
    model: 'Gemini 2.5 Pro',
    inputPricePer1M: 1.875, // Average of $1.25-$2.50 range
    outputPricePer1M: 3.75, // Estimated 2x input cost
    contextWindow: 1000000, // Large context window
  },
  'gemini-2.5-flash': {
    model: 'Gemini 2.5 Flash',
    inputPricePer1M: 0.15,
    outputPricePer1M: 0.3, // Estimated 2x input cost
    contextWindow: 1000000, // Large context window
  },
  // Qwen Models
  'qwen-2.5-vl-7b-instruct': {
    model: 'Qwen2.5-VL-7B-Instruct',
    inputPricePer1M: 0.05,
    outputPricePer1M: 0.1, // Estimated 2x input cost
    contextWindow: 32768,
  },
  // Meta Llama Models
  'llama-3.1-8b-instruct': {
    model: 'Llama 3.1 8B Instruct',
    inputPricePer1M: 0.06,
    outputPricePer1M: 0.12, // Estimated 2x input cost
    contextWindow: 128000,
  },
  // THUDM GLM Models
  'glm-4-9b-0414': {
    model: 'GLM-4-9B-0414',
    inputPricePer1M: 0.086,
    outputPricePer1M: 0.172, // Estimated 2x input cost
    contextWindow: 128000,
  },
  // DeepSeek Models
  'deepseek-r1': {
    model: 'DeepSeek-R1',
    inputPricePer1M: 0.28,
    outputPricePer1M: 0.42,
    contextWindow: 128000,
  },
} as const;
