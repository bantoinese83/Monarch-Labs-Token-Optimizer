import { describe, it, expect } from 'vitest';
import { parseCSV } from './csvParser';

describe('parseCSV', () => {
  // Golden test cases - known good inputs/outputs
  describe('Golden Cases', () => {
    it('should parse simple CSV with header and one row', () => {
      const csv = 'name,age,city\nJohn,30,New York';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'age', 'city'],
        ['John', '30', 'New York'],
      ]);
    });

    it('should parse CSV with multiple rows', () => {
      const csv = 'id,name,email\n1,John,john@example.com\n2,Jane,jane@example.com';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['id', 'name', 'email'],
        ['1', 'John', 'john@example.com'],
        ['2', 'Jane', 'jane@example.com'],
      ]);
    });

    it('should parse CSV with quoted fields containing commas', () => {
      const csv = 'name,description\nJohn,"John, the developer"\nJane,"Jane, the designer"';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'description'],
        ['John', 'John, the developer'],
        ['Jane', 'Jane, the designer'],
      ]);
    });

    it('should parse CSV with escaped quotes', () => {
      const csv = 'name,quote\nJohn,"He said ""Hello"""';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'quote'],
        ['John', 'He said "Hello"'],
      ]);
    });

    it('should parse CSV with newlines in quoted fields', () => {
      const csv = 'id,description\n1,"Line 1\nLine 2"\n2,"Single line"';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['id', 'description'],
        ['1', 'Line 1\nLine 2'],
        ['2', 'Single line'],
      ]);
    });

    it('should parse CSV with empty fields', () => {
      const csv = 'name,age,email\nJohn,30,\nJane,,jane@example.com';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'age', 'email'],
        ['John', '30', ''],
        ['Jane', '', 'jane@example.com'],
      ]);
    });

    it('should parse CSV with trailing commas', () => {
      const csv = 'name,age,\nJohn,30,\nJane,25,';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'age', ''],
        ['John', '30', ''],
        ['Jane', '25', ''],
      ]);
    });

    it('should parse CSV with Windows line endings (CRLF)', () => {
      const csv = 'name,age\r\nJohn,30\r\nJane,25';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'age'],
        ['John', '30'],
        ['Jane', '25'],
      ]);
    });

    it('should parse CSV with Unix line endings (LF)', () => {
      const csv = 'name,age\nJohn,30\nJane,25';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'age'],
        ['John', '30'],
        ['Jane', '25'],
      ]);
    });

    it('should parse CSV with Mac line endings (CR)', () => {
      const csv = 'name,age\rJohn,30\rJane,25';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'age'],
        ['John', '30'],
        ['Jane', '25'],
      ]);
    });

    it('should parse CSV with spaces around commas', () => {
      const csv = 'name, age , city\nJohn, 30 , New York';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'age', 'city'],
        ['John', '30', 'New York'],
      ]);
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('should handle empty CSV string', () => {
      const csv = '';
      const result = parseCSV(csv);
      expect(result).toEqual([]);
    });

    it('should handle CSV with only header', () => {
      const csv = 'name,age,city';
      const result = parseCSV(csv);
      expect(result).toEqual([['name', 'age', 'city']]);
    });

    it('should handle CSV with only whitespace', () => {
      const csv = '   \n  \n  ';
      const result = parseCSV(csv);
      expect(result).toEqual([]);
    });

    it('should handle CSV with single field per row', () => {
      const csv = 'name\nJohn\nJane';
      const result = parseCSV(csv);
      expect(result).toEqual([['name'], ['John'], ['Jane']]);
    });

    it('should handle CSV with many columns', () => {
      const csv = 'a,b,c,d,e,f,g,h,i,j\n1,2,3,4,5,6,7,8,9,10';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      ]);
    });

    it('should handle CSV with very long field values', () => {
      const longValue = 'a'.repeat(1000);
      const csv = `name,description\nJohn,"${longValue}"`;
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'description'],
        ['John', longValue],
      ]);
    });

    it('should handle CSV with special characters', () => {
      const csv = 'name,value\n"Test & Value","<tag>content</tag>"';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'value'],
        ['Test & Value', '<tag>content</tag>'],
      ]);
    });

    it('should handle CSV with Unicode characters', () => {
      const csv = 'name,value\n"José","café"\n"北京","上海"';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'value'],
        ['José', 'café'],
        ['北京', '上海'],
      ]);
    });

    it('should handle CSV with emojis', () => {
      const csv = 'name,emoji\n"John 😊","✅"\n"Jane 🎉","🚀"';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'emoji'],
        ['John 😊', '✅'],
        ['Jane 🎉', '🚀'],
      ]);
    });

    it('should handle CSV with unclosed quotes', () => {
      const csv = 'name,description\nJohn,"Unclosed quote';
      const result = parseCSV(csv);
      // Should still parse, treating unclosed quote as part of field
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toEqual(['name', 'description']);
    });

    it('should handle CSV with mixed quote styles', () => {
      const csv = 'name,quote\nJohn,"He said \'Hello\'"';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'quote'],
        ['John', "He said 'Hello'"],
      ]);
    });

    it('should handle CSV with trailing newline', () => {
      const csv = 'name,age\nJohn,30\n';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'age'],
        ['John', '30'],
      ]);
    });

    it('should handle CSV with leading newline', () => {
      const csv = '\nname,age\nJohn,30';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'age'],
        ['John', '30'],
      ]);
    });

    it('should handle CSV with tabs in fields', () => {
      const csv = 'name,value\n"John\tSmith",30';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'value'],
        ['John\tSmith', '30'],
      ]);
    });

    it('should handle CSV with numbers as strings', () => {
      const csv = 'id,value\n"001","123.45"';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['id', 'value'],
        ['001', '123.45'],
      ]);
    });

    it('should handle CSV with boolean-like strings', () => {
      const csv = 'name,active\nJohn,"true"\nJane,"false"';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'active'],
        ['John', 'true'],
        ['Jane', 'false'],
      ]);
    });

    it('should handle CSV with dates', () => {
      const csv = 'name,birthdate\nJohn,"2023-01-15"\nJane,"2023-12-31"';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'birthdate'],
        ['John', '2023-01-15'],
        ['Jane', '2023-12-31'],
      ]);
    });

    it('should handle CSV with URLs', () => {
      const csv = 'name,url\nJohn,"https://example.com?q=test&id=123"';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'url'],
        ['John', 'https://example.com?q=test&id=123'],
      ]);
    });

    it('should handle CSV with JSON-like content', () => {
      const csv = 'id,data\n1,"{""key"": ""value""}"';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['id', 'data'],
        ['1', '{"key": "value"}'],
      ]);
    });

    it('should trim whitespace from fields', () => {
      const csv = '  name  ,  age  \n  John  ,  30  ';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'age'],
        ['John', '30'],
      ]);
    });

    it('should handle CSV with inconsistent column counts', () => {
      const csv = 'name,age,city\nJohn,30\nJane,25,New York,USA';
      const result = parseCSV(csv);
      expect(result).toEqual([
        ['name', 'age', 'city'],
        ['John', '30'],
        ['Jane', '25', 'New York', 'USA'],
      ]);
    });
  });

  // Real-world test case from user issue
  describe('Real-world Cases', () => {
    it('should parse Monarch Genie CSV example', () => {
      const csv = `id,source,sentiment,topic,keywords,original_url,summary,target_audience,action_recommended,timestamp
MG-001,Twitter,positive,product_feedback,"Monarch Genie|easy to use|time saver",https://twitter.com/user123/status/123456789,"User praised Monarch Genie for its ease of use and time-saving features for managing online mentions.",solo_entrepreneur,Share as testimonial,2023-10-26T10:00:00Z
MG-002,Blog Comment,negative,customer_service,"Monarch Genie|support|slow response",https://exampleblog.com/post/monarch-genie-review#comment-456,"Small business owner reported slow response times from Monarch Genie customer support.",small_business,Escalate to support team,2023-10-26T11:30:00Z`;
      
      const result = parseCSV(csv);
      expect(result.length).toBe(3); // Header + 2 rows
      expect(result[0]).toEqual([
        'id',
        'source',
        'sentiment',
        'topic',
        'keywords',
        'original_url',
        'summary',
        'target_audience',
        'action_recommended',
        'timestamp',
      ]);
      expect(result[1]![0]).toBe('MG-001');
      expect(result[1]![4]).toBe('Monarch Genie|easy to use|time saver');
    });
  });
});

