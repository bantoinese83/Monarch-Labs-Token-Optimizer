import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CSVTable } from './CSVTable';

describe('CSVTable', () => {
  describe('Golden Cases', () => {
    it('should render CSV table with header and rows', () => {
      const csv = 'name,age,city\nJohn,30,New York\nJane,25,Los Angeles';
      render(<CSVTable csv={csv} />);

      expect(screen.getByText('name')).toBeInTheDocument();
      expect(screen.getByText('age')).toBeInTheDocument();
      expect(screen.getByText('city')).toBeInTheDocument();
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('New York')).toBeInTheDocument();
    });

    it('should render table with correct structure', () => {
      const csv = 'id,name\n1,John';
      render(<CSVTable csv={csv} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('should handle quoted fields with commas', () => {
      const csv = 'name,description\nJohn,"John, the developer"';
      render(<CSVTable csv={csv} />);

      expect(screen.getByText('John, the developer')).toBeInTheDocument();
    });

    it('should handle multiple rows', () => {
      const csv = 'name,age\nJohn,30\nJane,25\nBob,40';
      render(<CSVTable csv={csv} />);

      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should render Monarch Genie example correctly', () => {
      const csv = `id,source,sentiment,topic,keywords,original_url,summary,target_audience,action_recommended,timestamp
MG-001,Twitter,positive,product_feedback,"Monarch Genie|easy to use|time saver",https://twitter.com/user123/status/123456789,"User praised Monarch Genie for its ease of use and time-saving features for managing online mentions.",solo_entrepreneur,Share as testimonial,2023-10-26T10:00:00Z`;

      render(<CSVTable csv={csv} />);

      expect(screen.getByText('MG-001')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('positive')).toBeInTheDocument();
      expect(screen.getByText('Monarch Genie|easy to use|time saver')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty CSV', () => {
      render(<CSVTable csv="" />);
      expect(screen.getByText('No CSV data to display')).toBeInTheDocument();
    });

    it('should handle CSV with only header', () => {
      const csv = 'name,age,city';
      render(<CSVTable csv={csv} />);

      expect(screen.getByText('name')).toBeInTheDocument();
      expect(screen.getByText('age')).toBeInTheDocument();
      expect(screen.getByText('city')).toBeInTheDocument();
    });

    it('should handle CSV with empty fields', () => {
      const csv = 'name,age,email\nJohn,30,\nJane,,jane@example.com';
      render(<CSVTable csv={csv} />);

      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
    });

    it('should handle CSV with inconsistent column counts', () => {
      const csv = 'name,age,city\nJohn,30\nJane,25,New York,USA';
      render(<CSVTable csv={csv} />);

      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
    });

    it('should handle CSV with many columns', () => {
      const csv = 'a,b,c,d,e,f,g,h,i,j\n1,2,3,4,5,6,7,8,9,10';
      render(<CSVTable csv={csv} />);

      expect(screen.getByText('a')).toBeInTheDocument();
      expect(screen.getByText('j')).toBeInTheDocument();
    });

    it('should handle CSV with Unicode characters', () => {
      const csv = 'name,value\n"José","café"\n"北京","上海"';
      render(<CSVTable csv={csv} />);

      expect(screen.getByText('José')).toBeInTheDocument();
      expect(screen.getByText('café')).toBeInTheDocument();
    });

    it('should handle CSV with special characters', () => {
      const csv = 'name,value\n"Test & Value","<tag>content</tag>"';
      render(<CSVTable csv={csv} />);

      expect(screen.getByText('Test & Value')).toBeInTheDocument();
    });

    it('should handle malformed CSV gracefully', () => {
      const csv = 'name,age\nJohn,30\n"Unclosed quote';
      render(<CSVTable csv={csv} />);

      // Should still render what it can parse
      expect(screen.getByText('name')).toBeInTheDocument();
      expect(screen.getByText('John')).toBeInTheDocument();
    });
  });
});

