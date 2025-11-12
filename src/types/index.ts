export interface TokenBreakdown {
  total: number;
  structure: number;
  data: number;
}

export interface FormatData {
  code: string;
  token_breakdown: TokenBreakdown;
}

export interface ComparisonCode {
  json: { code: string };
  csv: { code: string };
  toon: { code: string };
  yaml: { code: string };
}

export interface ComparisonResult {
  json: FormatData;
  csv: FormatData;
  toon: FormatData;
  yaml: FormatData;
}

export type FormatName = 'JSON' | 'CSV' | 'TOON' | 'YAML';

export interface AppState {
  comparisonResult: ComparisonResult | null;
  isLoading: boolean;
  error: string | null;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export interface SavedComparison {
  id: string;
  timestamp: number;
  inputText: string;
  result: ComparisonResult;
  tags?: string[];
  notes?: string;
}

export interface AdvancedMetrics {
  tokenDensity: number;
  structureOverhead: number;
  dataEfficiency: number;
  formatComplexity: number;
  compressionRatio: number;
  savingsPercentage: number;
  characterToTokenRatio: number;
}

export interface DataTypeBreakdown {
  strings: number;
  numbers: number;
  arrays: number;
  objects: number;
  booleans: number;
  nulls: number;
}

export interface FormatAnalysis {
  formatName: FormatName;
  metrics: AdvancedMetrics;
  dataTypeBreakdown: DataTypeBreakdown;
  whitespaceTokens: number;
  nestingDepth: number;
  insights: string[];
}

export interface APIPricing {
  model: string;
  inputPricePer1M: number;
  outputPricePer1M: number;
  contextWindow: number;
}

export interface CostEstimate {
  model: string;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  tokensUsed: number;
  withinContextWindow: boolean;
}

export interface ComparisonSummary {
  format: FormatName;
  tokens: number;
  percentageDiff: number;
  savings: number;
  cost: number;
  efficiency: number;
}

export type SortOption = 'tokens' | 'savings' | 'cost' | 'efficiency' | 'name';
export type FilterOption = FormatName | 'all';
