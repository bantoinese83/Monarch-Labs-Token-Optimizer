import { describe, it, expect } from 'vitest';
import { analyzeTokens } from './tokenizer';

describe('analyzeTokens', () => {
  // Golden test cases - known good inputs/outputs
  describe('Golden Cases', () => {
    it('should analyze simple JSON string', () => {
      const text = '{"name":"John","age":30}';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.structure).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
      expect(result.total).toBe(result.structure + result.data);
    });

    it('should analyze CSV string', () => {
      const text = 'name,age,city\nJohn,30,New York';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.structure).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });

    it('should analyze YAML string', () => {
      const text = 'name: John\nage: 30\ncity: New York';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.structure).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });

    it('should analyze TOON format string', () => {
      const text = 'name: John\nage: 30';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.structure).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });

    it('should correctly identify structural tokens', () => {
      const text = '{}[]:,"';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.structure).toBeGreaterThan(0);
      // Most tokens should be structural for this input
      expect(result.structure / result.total).toBeGreaterThan(0.5);
    });

    it('should correctly identify data tokens', () => {
      const text = 'Hello World This is data';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
      // Most tokens should be data for this input
      expect(result.data / result.total).toBeGreaterThan(0.5);
    });

    it('should handle mixed content', () => {
      const text = '{"name":"John","items":["apple","banana"]}';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.structure).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });

    it('should produce consistent results for same input', () => {
      const text = '{"test":"value"}';
      const result1 = analyzeTokens(text);
      const result2 = analyzeTokens(text);

      expect(result1.total).toBe(result2.total);
      expect(result1.structure).toBe(result2.structure);
      expect(result1.data).toBe(result2.data);
    });

    it('should handle nested structures', () => {
      const text = '{"level1":{"level2":{"level3":"value"}}}';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.structure).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });

    it('should handle arrays', () => {
      const text = '[1,2,3,4,5]';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.structure).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      const result = analyzeTokens('');
      expect(result.total).toBe(0);
      expect(result.structure).toBe(0);
      expect(result.data).toBe(0);
    });

    it('should handle whitespace only', () => {
      const text = '   \n\t  ';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      // Whitespace should be counted as structural
      expect(result.structure).toBeGreaterThan(0);
    });

    it('should handle single character', () => {
      const result = analyzeTokens('a');
      expect(result.total).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });

    it('should handle very long strings', () => {
      const text = 'a'.repeat(10000);
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });

    it('should handle Unicode characters', () => {
      const text = '{"name":"José","city":"北京","emoji":"😊"}';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });

    it('should handle special characters', () => {
      const text = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      // Special characters might be structural or data depending on context
      expect(result.structure + result.data).toBe(result.total);
    });

    it('should handle numbers', () => {
      const text = '1234567890';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });

    it('should handle decimal numbers', () => {
      const text = '3.14159265359';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });

    it('should handle negative numbers', () => {
      const text = '-123.45';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });

    it('should handle URLs', () => {
      const text = 'https://example.com/path?query=value&other=123';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });

    it('should handle email addresses', () => {
      const text = 'user@example.com';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });

    it('should handle dates', () => {
      const text = '2023-10-26T10:00:00Z';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });

    it('should handle boolean values', () => {
      const text = 'true false';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });

    it('should handle null values', () => {
      const text = 'null';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });

    it('should handle escaped characters', () => {
      const text = '"Hello\\nWorld\\tTab"';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.structure).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });

    it('should handle multiline strings', () => {
      const text = 'Line 1\nLine 2\nLine 3';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });

    it('should handle JSON with all data types', () => {
      const text =
        '{"string":"value","number":123,"boolean":true,"null":null,"array":[1,2,3],"object":{"nested":"value"}}';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.structure).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });

    it('should handle CSV with many columns', () => {
      const text = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      // Commas are structural tokens
      expect(result.structure + result.data).toBe(result.total);
      expect(result.data).toBeGreaterThan(0); // Letters are data tokens
    });

    it('should handle YAML with complex nesting', () => {
      const text = `level1:
  level2:
    level3:
      - item1
      - item2
      - item3`;
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.structure).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });

    it('should handle strings with only structural tokens', () => {
      const text = '{},[]:';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.structure).toBe(result.total);
      expect(result.data).toBe(0);
    });

    it('should handle strings with only data tokens', () => {
      const text = 'HelloWorld';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
      // Most tokens should be data
      expect(result.data / result.total).toBeGreaterThan(0.5);
    });

    it('should maintain total = structure + data', () => {
      const testCases = [
        '{"test":"value"}',
        'name,age\nJohn,30',
        'name: John\nage: 30',
        'simple text',
        '{}[]:,"',
        '123456',
      ];

      testCases.forEach(text => {
        const result = analyzeTokens(text);
        expect(result.total).toBe(result.structure + result.data);
      });
    });
  });

  // Real-world test cases
  describe('Real-world Cases', () => {
    it('should analyze Monarch Genie example JSON', () => {
      const text =
        '[{"id":"MG-001","source":"Twitter","sentiment":"positive","topic":"product_feedback","keywords":["Monarch Genie","easy to use","time saver"],"original_url":"https://twitter.com/user123/status/123456789","summary":"User praised Monarch Genie for its ease of use and time-saving features for managing online mentions.","target_audience":"solo_entrepreneur","action_recommended":"Share as testimonial","timestamp":"2023-10-26T10:00:00Z"}]';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(100);
      expect(result.structure).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
      expect(result.total).toBe(result.structure + result.data);
    });

    it('should analyze customer order system JSON', () => {
      const text =
        '{"order_id":2847392,"customer_id":89234,"timestamp":"2025-01-15T14:32:18Z","status":"pending","items":[{"sku":"PROD-7821-A","quantity":2,"price":89.99}]}';
      const result = analyzeTokens(text);

      expect(result.total).toBeGreaterThan(0);
      expect(result.structure).toBeGreaterThan(0);
      expect(result.data).toBeGreaterThan(0);
    });
  });
});

