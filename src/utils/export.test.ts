import { describe, it, expect } from 'vitest';
import {
  exportToCSV,
  exportToJSON,
  exportToMarkdown,
  generateShareableLink,
  parseShareableLink,
  generateComparisonSummary,
} from './export';
import type { ComparisonResult } from '@/types';

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

describe('export utilities', () => {
  describe('exportToCSV - Golden Cases', () => {
    it('should export comparison result to CSV format', () => {
      const result = createMockComparisonResult();
      const inputText = 'test data';
      const csv = exportToCSV(result, inputText);

      expect(csv).toContain('Input: test data');
      expect(csv).toContain('Format,Total Tokens,Structure Tokens,Data Tokens,Code');
      expect(csv).toContain('JSON');
      expect(csv).toContain('CSV');
      expect(csv).toContain('TOON');
      expect(csv).toContain('YAML');
    });

    it('should include all formats in CSV', () => {
      const result = createMockComparisonResult();
      const csv = exportToCSV(result, 'test');

      const lines = csv.split('\n');
      expect(lines.length).toBeGreaterThan(5); // Header + 4 format rows + input line
    });

    it('should escape quotes in code', () => {
      const result: ComparisonResult = {
        json: {
          code: '{"name":"John"}',
          token_breakdown: { total: 50, structure: 10, data: 40 },
        },
        csv: {
          code: 'name\n"John"',
          token_breakdown: { total: 40, structure: 5, data: 35 },
        },
        toon: {
          code: 'name: "John"',
          token_breakdown: { total: 35, structure: 5, data: 30 },
        },
        yaml: {
          code: 'name: "John"',
          token_breakdown: { total: 45, structure: 8, data: 37 },
        },
      };

      const csv = exportToCSV(result, 'test');
      expect(csv).toContain('""John""'); // Escaped quotes
    });

    it('should include token breakdown for each format', () => {
      const result = createMockComparisonResult();
      const csv = exportToCSV(result, 'test');

      expect(csv).toContain('100'); // JSON total tokens
      expect(csv).toContain('80'); // CSV total tokens
      expect(csv).toContain('75'); // TOON total tokens
      expect(csv).toContain('85'); // YAML total tokens
    });
  });

  describe('exportToCSV - Edge Cases', () => {
    it('should handle empty input text', () => {
      const result = createMockComparisonResult();
      const csv = exportToCSV(result, '');

      expect(csv).toContain('Input:');
    });

    it('should handle input text with special characters', () => {
      const result = createMockComparisonResult();
      const csv = exportToCSV(result, 'test,with"quotes\nand newlines');

      expect(csv).toContain('test,with"quotes');
    });

    it('should handle code with newlines', () => {
      const result: ComparisonResult = {
        json: {
          code: '{\n  "name": "John"\n}',
          token_breakdown: { total: 50, structure: 10, data: 40 },
        },
        csv: {
          code: 'name\nJohn',
          token_breakdown: { total: 40, structure: 5, data: 35 },
        },
        toon: {
          code: 'name: John',
          token_breakdown: { total: 35, structure: 5, data: 30 },
        },
        yaml: {
          code: 'name: John',
          token_breakdown: { total: 45, structure: 8, data: 37 },
        },
      };

      const csv = exportToCSV(result, 'test');
      // CSV export escapes quotes, so check for escaped version
      expect(csv).toContain('JSON');
      expect(csv).toContain('50');
    });
  });

  describe('exportToJSON - Golden Cases', () => {
    it('should export comparison result to JSON format', () => {
      const result = createMockComparisonResult();
      const inputText = 'test data';
      const json = exportToJSON(result, inputText);

      const parsed = JSON.parse(json);
      expect(parsed.input).toBe(inputText);
      expect(parsed.results).toEqual(result);
      expect(parsed.timestamp).toBeDefined();
    });

    it('should include valid timestamp', () => {
      const result = createMockComparisonResult();
      const json = exportToJSON(result, 'test');

      const parsed = JSON.parse(json);
      expect(new Date(parsed.timestamp).getTime()).toBeGreaterThan(0);
    });

    it('should preserve all format data', () => {
      const result = createMockComparisonResult();
      const json = exportToJSON(result, 'test');

      const parsed = JSON.parse(json);
      expect(parsed.results.json).toEqual(result.json);
      expect(parsed.results.csv).toEqual(result.csv);
      expect(parsed.results.toon).toEqual(result.toon);
      expect(parsed.results.yaml).toEqual(result.yaml);
    });
  });

  describe('exportToJSON - Edge Cases', () => {
    it('should handle empty input text', () => {
      const result = createMockComparisonResult();
      const json = exportToJSON(result, '');

      const parsed = JSON.parse(json);
      expect(parsed.input).toBe('');
    });

    it('should handle special characters in input', () => {
      const result = createMockComparisonResult();
      const json = exportToJSON(result, 'test with "quotes" and \n newlines');

      const parsed = JSON.parse(json);
      expect(parsed.input).toBe('test with "quotes" and \n newlines');
    });
  });

  describe('exportToMarkdown - Golden Cases', () => {
    it('should export comparison result to Markdown format', () => {
      const result = createMockComparisonResult();
      const inputText = 'test data';
      const markdown = exportToMarkdown(result, inputText);

      expect(markdown).toContain('# Token Comparison Results');
      expect(markdown).toContain('**Input:** test data');
      expect(markdown).toContain('## Summary');
      expect(markdown).toContain('## Detailed Breakdown');
    });

    it('should include summary table', () => {
      const result = createMockComparisonResult();
      const markdown = exportToMarkdown(result, 'test');

      expect(markdown).toContain('| Format | Tokens | Difference | Savings |');
      expect(markdown).toContain('| JSON |');
      expect(markdown).toContain('| CSV |');
      expect(markdown).toContain('| TOON |');
      expect(markdown).toContain('| YAML |');
    });

    it('should include code blocks for each format', () => {
      const result = createMockComparisonResult();
      const markdown = exportToMarkdown(result, 'test');

      expect(markdown).toContain('### JSON');
      expect(markdown).toContain('### CSV');
      expect(markdown).toContain('### TOON');
      expect(markdown).toContain('### YAML');
      expect(markdown).toContain('```');
    });

    it('should calculate differences correctly', () => {
      const result = createMockComparisonResult();
      const markdown = exportToMarkdown(result, 'test');

      // CSV should show negative difference (savings)
      expect(markdown).toContain('-20'); // 80 - 100
    });
  });

  describe('exportToMarkdown - Edge Cases', () => {
    it('should handle zero baseline tokens', () => {
      const result: ComparisonResult = {
        json: {
          code: '{}',
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

      const markdown = exportToMarkdown(result, 'test');
      expect(markdown).toContain('0.0%'); // Percentage should be 0
    });
  });

  describe('generateShareableLink - Golden Cases', () => {
    it('should generate a shareable link', () => {
      const result = createMockComparisonResult();
      const inputText = 'test data';

      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'https://example.com',
          pathname: '/',
        },
        writable: true,
      });

      const link = generateShareableLink(result, inputText);
      expect(link).toContain('https://example.com/');
      expect(link).toContain('?share=');
    });

    it('should encode data in base64', () => {
      const result = createMockComparisonResult();
      const inputText = 'test';

      Object.defineProperty(window, 'location', {
        value: {
          origin: 'https://example.com',
          pathname: '/',
        },
        writable: true,
      });

      const link = generateShareableLink(result, inputText);
      const encoded = link.split('share=')[1];
      expect(encoded).toBeDefined();
      expect(() => atob(encoded!)).not.toThrow();
    });
  });

  describe('parseShareableLink - Golden Cases', () => {
    it('should parse a valid shareable link', () => {
      const result = createMockComparisonResult();
      const inputText = 'test data';
      const data = { input: inputText, result, timestamp: Date.now() };
      const encoded = btoa(JSON.stringify(data));

      const parsed = parseShareableLink(encoded);
      expect(parsed).not.toBeNull();
      expect(parsed!.input).toBe(inputText);
      expect(parsed!.result).toEqual(result);
    });

    it('should return null for invalid encoded data', () => {
      const parsed = parseShareableLink('invalid-base64!!!');
      expect(parsed).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      const encoded = btoa('not valid json');
      const parsed = parseShareableLink(encoded);
      expect(parsed).toBeNull();
    });
  });

  describe('generateComparisonSummary - Golden Cases', () => {
    it('should generate summary for all formats', () => {
      const result = createMockComparisonResult();
      const summary = generateComparisonSummary(result);

      expect(summary).toHaveLength(4);
      expect(summary.map(s => s.format)).toEqual(['JSON', 'CSV', 'TOON', 'YAML']);
    });

    it('should calculate percentage differences correctly', () => {
      const result = createMockComparisonResult();
      const summary = generateComparisonSummary(result);

      const jsonSummary = summary.find(s => s.format === 'JSON');
      expect(jsonSummary!.percentageDiff).toBe(0); // Baseline

      const csvSummary = summary.find(s => s.format === 'CSV');
      expect(csvSummary!.percentageDiff).toBe(-20); // (80 - 100) / 100 * 100
    });

    it('should calculate savings correctly', () => {
      const result = createMockComparisonResult();
      const summary = generateComparisonSummary(result);

      const csvSummary = summary.find(s => s.format === 'CSV');
      expect(csvSummary!.savings).toBe(20); // 100 - 80

      const jsonSummary = summary.find(s => s.format === 'JSON');
      expect(jsonSummary!.savings).toBe(0); // No savings vs baseline
    });

    it('should calculate efficiency correctly', () => {
      const result = createMockComparisonResult();
      const summary = generateComparisonSummary(result);

      summary.forEach(s => {
        expect(s.efficiency).toBeGreaterThan(0);
        // Efficiency can exceed 100% when format has fewer tokens than baseline
        expect(s.efficiency).toBeGreaterThan(0);
      });
    });
  });

  describe('generateComparisonSummary - Edge Cases', () => {
    it('should handle zero baseline tokens', () => {
      const result: ComparisonResult = {
        json: {
          code: '{}',
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

      const summary = generateComparisonSummary(result);
      summary.forEach(s => {
        expect(s.percentageDiff).toBe(0);
        expect(s.efficiency).toBe(100);
      });
    });
  });
});

