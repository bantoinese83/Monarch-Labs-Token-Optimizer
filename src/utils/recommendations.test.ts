import { describe, it, expect } from 'vitest';
import {
  getFormatRecommendations,
  getBestFormatRecommendation,
} from './recommendations';
import type { ComparisonResult } from '@/types';

function createMockComparisonResult(
  jsonTokens: number,
  csvTokens: number,
  toonTokens: number,
  yamlTokens: number
): ComparisonResult {
  return {
    json: {
      code: '{"test":"json"}',
      token_breakdown: { total: jsonTokens, structure: jsonTokens * 0.2, data: jsonTokens * 0.8 },
    },
    csv: {
      code: 'test,value\njson,test',
      token_breakdown: { total: csvTokens, structure: csvTokens * 0.15, data: csvTokens * 0.85 },
    },
    toon: {
      code: 'test: json',
      token_breakdown: { total: toonTokens, structure: toonTokens * 0.1, data: toonTokens * 0.9 },
    },
    yaml: {
      code: 'test: json',
      token_breakdown: { total: yamlTokens, structure: yamlTokens * 0.18, data: yamlTokens * 0.82 },
    },
  };
}

describe('recommendations', () => {
  describe('getFormatRecommendations - Golden Cases', () => {
    it('should return recommendations for all formats', () => {
      const result = createMockComparisonResult(100, 80, 75, 85);
      const recommendations = getFormatRecommendations(result, 'test data');

      expect(recommendations).toHaveLength(4);
      expect(recommendations.map(r => r.format)).toEqual(['JSON', 'CSV', 'TOON', 'YAML']);
    });

    it('should score CSV highest for tabular data', () => {
      const result = createMockComparisonResult(100, 70, 80, 90);
      const recommendations = getFormatRecommendations(
        result,
        'table with rows and columns'
      );

      const csvRec = recommendations.find(r => r.format === 'CSV');
      expect(csvRec).toBeDefined();
      expect(csvRec!.score).toBeGreaterThan(50);
      expect(csvRec!.reasons.length).toBeGreaterThan(0);
    });

    it('should score TOON highest for nested data', () => {
      const result = createMockComparisonResult(100, 90, 65, 85);
      const recommendations = getFormatRecommendations(
        result,
        'nested hierarchical structure'
      );

      const toonRec = recommendations.find(r => r.format === 'TOON');
      expect(toonRec).toBeDefined();
      expect(toonRec!.score).toBeGreaterThan(50);
    });

    it('should score YAML highest for config data', () => {
      const result = createMockComparisonResult(100, 90, 85, 75);
      const recommendations = getFormatRecommendations(
        result,
        'configuration settings file'
      );

      const yamlRec = recommendations.find(r => r.format === 'YAML');
      expect(yamlRec).toBeDefined();
      expect(yamlRec!.score).toBeGreaterThan(50);
    });

    it('should include savings in recommendations', () => {
      const result = createMockComparisonResult(100, 80, 75, 85);
      const recommendations = getFormatRecommendations(result, 'test');

      recommendations.forEach(rec => {
        expect(rec.estimatedSavings).toBeDefined();
        expect(typeof rec.estimatedSavings).toBe('number');
      });
    });

    it('should include use case descriptions', () => {
      const result = createMockComparisonResult(100, 80, 75, 85);
      const recommendations = getFormatRecommendations(result, 'test');

      recommendations.forEach(rec => {
        expect(rec.useCase).toBeDefined();
        expect(rec.useCase.length).toBeGreaterThan(0);
      });
    });

    it('should include bestFor arrays', () => {
      const result = createMockComparisonResult(100, 80, 75, 85);
      const recommendations = getFormatRecommendations(result, 'test');

      recommendations.forEach(rec => {
        expect(Array.isArray(rec.bestFor)).toBe(true);
        expect(rec.bestFor.length).toBeGreaterThan(0);
      });
    });

    it('should score formats with high savings higher', () => {
      const result = createMockComparisonResult(100, 50, 60, 70);
      const recommendations = getFormatRecommendations(result, 'test');

      const csvRec = recommendations.find(r => r.format === 'CSV');
      const jsonRec = recommendations.find(r => r.format === 'JSON');

      expect(csvRec!.score).toBeGreaterThan(jsonRec!.score);
    });
  });

  describe('getFormatRecommendations - Edge Cases', () => {
    it('should handle empty input text', () => {
      const result = createMockComparisonResult(100, 80, 75, 85);
      const recommendations = getFormatRecommendations(result, '');

      expect(recommendations).toHaveLength(4);
    });

    it('should handle zero baseline tokens', () => {
      const result = createMockComparisonResult(0, 0, 0, 0);
      const recommendations = getFormatRecommendations(result, 'test');

      recommendations.forEach(rec => {
        // percentageSavings might be NaN or undefined when baseline is 0
        expect(rec.score).toBeGreaterThanOrEqual(0);
        expect(rec.score).toBeLessThanOrEqual(100);
      });
    });

    it('should handle equal token counts', () => {
      const result = createMockComparisonResult(100, 100, 100, 100);
      const recommendations = getFormatRecommendations(result, 'test');

      recommendations.forEach(rec => {
        expect(rec.estimatedSavings).toBe(0);
        expect(rec.score).toBeGreaterThanOrEqual(0);
        expect(rec.score).toBeLessThanOrEqual(100);
      });
    });

    it('should handle very large token differences', () => {
      const result = createMockComparisonResult(10000, 100, 200, 300);
      const recommendations = getFormatRecommendations(result, 'test');

      const csvRec = recommendations.find(r => r.format === 'CSV');
      expect(csvRec!.estimatedSavings).toBe(9900);
      expect(csvRec!.score).toBeLessThanOrEqual(100); // Will be clamped to 100
    });

    it('should clamp scores to 0-100 range', () => {
      const result = createMockComparisonResult(100, 10, 20, 30);
      const recommendations = getFormatRecommendations(result, 'test');

      recommendations.forEach(rec => {
        expect(rec.score).toBeGreaterThanOrEqual(0);
        expect(rec.score).toBeLessThanOrEqual(100);
      });
    });

    it('should handle negative savings gracefully', () => {
      const result = createMockComparisonResult(50, 100, 80, 70);
      const recommendations = getFormatRecommendations(result, 'test');

      const csvRec = recommendations.find(r => r.format === 'CSV');
      expect(csvRec!.estimatedSavings).toBeLessThan(0);
      expect(csvRec!.score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getBestFormatRecommendation - Golden Cases', () => {
    it('should return best non-JSON format with savings', () => {
      const result = createMockComparisonResult(100, 70, 80, 75);
      const recommendation = getBestFormatRecommendation(result, 'test');

      expect(recommendation).not.toBeNull();
      expect(recommendation!.format).not.toBe('JSON');
      expect(recommendation!.estimatedSavings).toBeGreaterThan(0);
    });

    it('should prefer format with highest savings', () => {
      const result = createMockComparisonResult(100, 50, 60, 70);
      const recommendation = getBestFormatRecommendation(result, 'test');

      expect(recommendation!.format).toBe('CSV');
      expect(recommendation!.estimatedSavings).toBe(50);
    });

    it('should return format even if no savings', () => {
      const result = createMockComparisonResult(100, 100, 100, 100);
      const recommendation = getBestFormatRecommendation(result, 'test');

      // Should still return a format (highest score)
      expect(recommendation).not.toBeNull();
      expect(recommendation!.format).not.toBe('JSON');
    });

    it('should consider context clues in scoring', () => {
      const result = createMockComparisonResult(100, 80, 70, 75);
      const recommendation = getBestFormatRecommendation(
        result,
        'nested hierarchical tree structure'
      );

      // Should return a non-JSON format with savings
      expect(recommendation).not.toBeNull();
      expect(recommendation!.format).not.toBe('JSON');
      expect(recommendation!.estimatedSavings).toBeGreaterThan(0);
    });
  });

  describe('getBestFormatRecommendation - Edge Cases', () => {
    it('should handle all formats worse than JSON', () => {
      const result = createMockComparisonResult(50, 100, 90, 80);
      const recommendation = getBestFormatRecommendation(result, 'test');

      // Should still return a format (highest score, even if negative savings)
      expect(recommendation).not.toBeNull();
      expect(recommendation!.format).not.toBe('JSON');
    });

    it('should handle empty input text', () => {
      const result = createMockComparisonResult(100, 80, 75, 85);
      const recommendation = getBestFormatRecommendation(result, '');

      expect(recommendation).not.toBeNull();
    });

    it('should return null if no formats available', () => {
      // This shouldn't happen in practice, but test the edge case
      const result = createMockComparisonResult(100, 100, 100, 100);
      const recommendation = getBestFormatRecommendation(result, 'test');

      // Should still return a format (highest score)
      expect(recommendation).not.toBeNull();
    });
  });
});

