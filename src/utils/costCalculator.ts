import type { ComparisonResult, APIPricing, CostEstimate, FormatName } from '@/types';
import { API_PRICING } from '@/constants/costs';
import { CALCULATION_CONSTANTS } from '@/constants';

// Re-export API_PRICING for backward compatibility
export { API_PRICING };

export function calculateCost(
  tokens: number,
  pricing: APIPricing,
  isInput: boolean = true
): CostEstimate {
  const pricePer1M = isInput ? pricing.inputPricePer1M : pricing.outputPricePer1M;
  const cost = (tokens / CALCULATION_CONSTANTS.TOKENS_PER_MILLION) * pricePer1M;
  const withinContextWindow = tokens <= pricing.contextWindow;

  return {
    model: pricing.model,
    inputCost: isInput ? cost : 0,
    outputCost: isInput ? 0 : cost,
    totalCost: cost,
    tokensUsed: tokens,
    withinContextWindow,
  };
}

export function calculateCostsForAllFormats(
  result: ComparisonResult,
  modelKey: string
): Record<FormatName, CostEstimate> {
  const pricing = API_PRICING[modelKey];
  if (!pricing) {
    throw new Error(`Unknown model: ${modelKey}`);
  }

  const formats: FormatName[] = ['JSON', 'CSV', 'TOON', 'YAML'];
  const costs: Partial<Record<FormatName, CostEstimate>> = {};

  formats.forEach(format => {
    const key = format.toLowerCase() as keyof ComparisonResult;
    const data = result[key];
    costs[format] = calculateCost(data.token_breakdown.total, pricing, true);
  });

  return costs as Record<FormatName, CostEstimate>;
}

export function calculateROI(
  baselineTokens: number,
  optimizedTokens: number,
  requestsPerMonth: number,
  pricing: APIPricing
): {
  monthlySavings: number;
  yearlySavings: number;
  tokensSaved: number;
  percentageSavings: number;
} {
  const tokensSaved = baselineTokens - optimizedTokens;
  const costPerRequest =
    (baselineTokens / CALCULATION_CONSTANTS.TOKENS_PER_MILLION) * pricing.inputPricePer1M;
  const optimizedCostPerRequest =
    (optimizedTokens / CALCULATION_CONSTANTS.TOKENS_PER_MILLION) * pricing.inputPricePer1M;
  const savingsPerRequest = costPerRequest - optimizedCostPerRequest;
  const monthlySavings = savingsPerRequest * requestsPerMonth;
  const yearlySavings = monthlySavings * CALCULATION_CONSTANTS.MONTHS_PER_YEAR;
  const percentageSavings = baselineTokens > 0 ? (tokensSaved / baselineTokens) * 100 : 0;

  return {
    monthlySavings,
    yearlySavings,
    tokensSaved,
    percentageSavings,
  };
}
