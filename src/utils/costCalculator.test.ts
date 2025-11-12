import { describe, it, expect } from 'vitest';
import {
  calculateCost,
  calculateCostsForAllFormats,
  calculateROI,
  API_PRICING,
} from './costCalculator';
import type { ComparisonResult, FormatName } from '@/types';

// Mock comparison result for testing
function createMockComparisonResult(): ComparisonResult {
  return {
    json: {
      code: '{"name":"John","age":30}',
      token_breakdown: { total: 100, structure: 20, data: 80 },
    },
    csv: {
      code: 'name,age\nJohn,30',
      token_breakdown: { total: 80, structure: 15, data: 65 },
    },
    toon: {
      code: 'name: John\nage: 30',
      token_breakdown: { total: 75, structure: 10, data: 65 },
    },
    yaml: {
      code: 'name: John\nage: 30',
      token_breakdown: { total: 85, structure: 18, data: 67 },
    },
  };
}

describe('costCalculator', () => {
  describe('calculateCost - Golden Cases', () => {
    it('should calculate cost for input tokens', () => {
      const pricing = API_PRICING['gpt-4-turbo'];
      if (!pricing) throw new Error('Pricing not found');

      const result = calculateCost(1000, pricing, true);
      expect(result.model).toBe(pricing.model);
      expect(result.inputCost).toBeGreaterThan(0);
      expect(result.outputCost).toBe(0);
      expect(result.totalCost).toBe(result.inputCost);
      expect(result.tokensUsed).toBe(1000);
      expect(result.withinContextWindow).toBe(true);
    });

    it('should calculate cost for output tokens', () => {
      const pricing = API_PRICING['gpt-4-turbo'];
      if (!pricing) throw new Error('Pricing not found');

      const result = calculateCost(500, pricing, false);
      expect(result.inputCost).toBe(0);
      expect(result.outputCost).toBeGreaterThan(0);
      expect(result.totalCost).toBe(result.outputCost);
    });

    it('should detect when tokens exceed context window', () => {
      const pricing = API_PRICING['gpt-4-turbo'];
      if (!pricing) throw new Error('Pricing not found');

      const result = calculateCost(pricing.contextWindow + 1, pricing, true);
      expect(result.withinContextWindow).toBe(false);
    });

    it('should calculate cost correctly for different models', () => {
      const models: Array<keyof typeof API_PRICING> = [
        'gpt-4-turbo',
        'gpt-3.5-turbo',
        'claude-3-opus',
      ];

      models.forEach(modelKey => {
        const pricing = API_PRICING[modelKey];
        if (!pricing) return;

        const result = calculateCost(1000, pricing, true);
        expect(result.model).toBe(pricing.model);
        expect(result.totalCost).toBeGreaterThan(0);
        expect(result.tokensUsed).toBe(1000);
      });
    });
  });

  describe('calculateCost - Edge Cases', () => {
    it('should handle zero tokens', () => {
      const pricing = API_PRICING['gpt-4-turbo'];
      if (!pricing) throw new Error('Pricing not found');

      const result = calculateCost(0, pricing, true);
      expect(result.totalCost).toBe(0);
      expect(result.tokensUsed).toBe(0);
      expect(result.withinContextWindow).toBe(true);
    });

    it('should handle very large token counts', () => {
      const pricing = API_PRICING['gpt-4-turbo'];
      if (!pricing) throw new Error('Pricing not found');

      const largeTokenCount = 1000000;
      const result = calculateCost(largeTokenCount, pricing, true);
      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.withinContextWindow).toBe(false);
    });

    it('should handle exactly context window size', () => {
      const pricing = API_PRICING['gpt-4-turbo'];
      if (!pricing) throw new Error('Pricing not found');

      const result = calculateCost(pricing.contextWindow, pricing, true);
      expect(result.withinContextWindow).toBe(true);
    });

    it('should handle fractional costs correctly', () => {
      const pricing = API_PRICING['gpt-4-turbo'];
      if (!pricing) throw new Error('Pricing not found');

      // Small token count to get fractional cost
      const result = calculateCost(1, pricing, true);
      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.totalCost).toBeLessThan(0.01);
    });
  });

  describe('calculateCostsForAllFormats - Golden Cases', () => {
    it('should calculate costs for all formats', () => {
      const result = createMockComparisonResult();
      const costs = calculateCostsForAllFormats(result, 'gpt-4-turbo');

      const formats: FormatName[] = ['JSON', 'CSV', 'TOON', 'YAML'];
      formats.forEach(format => {
        expect(costs[format]).toBeDefined();
        expect(costs[format]!.tokensUsed).toBeGreaterThan(0);
        expect(costs[format]!.totalCost).toBeGreaterThanOrEqual(0);
      });
    });

    it('should return costs in correct order', () => {
      const result = createMockComparisonResult();
      const costs = calculateCostsForAllFormats(result, 'gpt-4-turbo');

      // CSV should have fewer tokens than JSON
      expect(costs.CSV.tokensUsed).toBeLessThan(costs.JSON.tokensUsed);
      expect(costs.CSV.totalCost).toBeLessThan(costs.JSON.totalCost);
    });
  });

  describe('calculateCostsForAllFormats - Edge Cases', () => {
    it('should throw error for unknown model', () => {
      const result = createMockComparisonResult();
      expect(() => {
        calculateCostsForAllFormats(result, 'unknown-model');
      }).toThrow('Unknown model');
    });

    it('should handle result with zero tokens', () => {
      const result: ComparisonResult = {
        json: {
          code: '',
          token_breakdown: { total: 0, structure: 0, data: 0 },
        },
        csv: {
          code: '',
          token_breakdown: { total: 0, structure: 0, data: 0 },
        },
        toon: {
          code: '',
          token_breakdown: { total: 0, structure: 0, data: 0 },
        },
        yaml: {
          code: '',
          token_breakdown: { total: 0, structure: 0, data: 0 },
        },
      };

      const costs = calculateCostsForAllFormats(result, 'gpt-4-turbo');
      expect(costs.JSON.totalCost).toBe(0);
      expect(costs.CSV.totalCost).toBe(0);
    });
  });

  describe('calculateROI - Golden Cases', () => {
    it('should calculate ROI correctly', () => {
      const pricing = API_PRICING['gpt-4-turbo'];
      if (!pricing) throw new Error('Pricing not found');

      const baselineTokens = 1000;
      const optimizedTokens = 800;
      const requestsPerMonth = 1000;

      const roi = calculateROI(baselineTokens, optimizedTokens, requestsPerMonth, pricing);

      expect(roi.tokensSaved).toBe(200);
      expect(roi.monthlySavings).toBeGreaterThan(0);
      expect(roi.yearlySavings).toBeGreaterThan(roi.monthlySavings);
      expect(roi.percentageSavings).toBe(20);
    });

    it('should calculate zero savings when optimized is higher', () => {
      const pricing = API_PRICING['gpt-4-turbo'];
      if (!pricing) throw new Error('Pricing not found');

      const baselineTokens = 800;
      const optimizedTokens = 1000;
      const requestsPerMonth = 1000;

      const roi = calculateROI(baselineTokens, optimizedTokens, requestsPerMonth, pricing);

      expect(roi.tokensSaved).toBeLessThan(0);
      expect(roi.monthlySavings).toBeLessThan(0);
      expect(roi.percentageSavings).toBeLessThan(0);
    });

    it('should calculate ROI for high volume', () => {
      const pricing = API_PRICING['gpt-4-turbo'];
      if (!pricing) throw new Error('Pricing not found');

      const baselineTokens = 1000;
      const optimizedTokens = 900;
      const requestsPerMonth = 100000;

      const roi = calculateROI(baselineTokens, optimizedTokens, requestsPerMonth, pricing);

      expect(roi.monthlySavings).toBeGreaterThan(0);
      expect(roi.yearlySavings).toBeGreaterThan(roi.monthlySavings * 10);
    });
  });

  describe('calculateROI - Edge Cases', () => {
    it('should handle zero baseline tokens', () => {
      const pricing = API_PRICING['gpt-4-turbo'];
      if (!pricing) throw new Error('Pricing not found');

      const roi = calculateROI(0, 0, 1000, pricing);
      expect(roi.percentageSavings).toBe(0);
      expect(roi.tokensSaved).toBe(0);
    });

    it('should handle zero requests per month', () => {
      const pricing = API_PRICING['gpt-4-turbo'];
      if (!pricing) throw new Error('Pricing not found');

      const roi = calculateROI(1000, 800, 0, pricing);
      expect(roi.monthlySavings).toBe(0);
      expect(roi.yearlySavings).toBe(0);
    });

    it('should handle equal baseline and optimized tokens', () => {
      const pricing = API_PRICING['gpt-4-turbo'];
      if (!pricing) throw new Error('Pricing not found');

      const roi = calculateROI(1000, 1000, 1000, pricing);
      expect(roi.tokensSaved).toBe(0);
      expect(roi.percentageSavings).toBe(0);
      expect(roi.monthlySavings).toBe(0);
    });

    it('should handle very large token differences', () => {
      const pricing = API_PRICING['gpt-4-turbo'];
      if (!pricing) throw new Error('Pricing not found');

      const roi = calculateROI(10000, 1000, 1000, pricing);
      expect(roi.tokensSaved).toBe(9000);
      expect(roi.percentageSavings).toBe(90);
      expect(roi.monthlySavings).toBeGreaterThan(0);
    });
  });
});

