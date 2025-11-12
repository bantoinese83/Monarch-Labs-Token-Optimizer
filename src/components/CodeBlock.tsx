import { useMemo } from 'react';
import type { FormatName } from '@/types';
import { CSVTable } from './CSVTable';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';

interface CodeBlockProps {
  code: string;
  format: FormatName;
}

function formatCode(code: string, format: FormatName): string {
  switch (format) {
    case 'JSON': {
      try {
        // Handle case where JSON is double-encoded (string containing JSON string)
        let parsed: unknown;
        try {
          parsed = JSON.parse(code);
          // If result is a string, try parsing again (double-encoded)
          if (typeof parsed === 'string') {
            parsed = JSON.parse(parsed);
          }
        } catch {
          // If double parse fails, use first parse result
          parsed = JSON.parse(code);
        }
        return JSON.stringify(parsed, null, 2);
      } catch {
        return code;
      }
    }
    case 'CSV':
    case 'TOON':
    case 'YAML':
      return code;
    default:
      return code;
  }
}

function getLanguage(format: FormatName): string {
  switch (format) {
    case 'JSON':
      return 'json';
    case 'YAML':
      return 'yaml';
    case 'TOON':
      return 'javascript'; // Use JS highlighting for TOON as it's similar
    case 'CSV':
      return 'csv';
    default:
      return 'text';
  }
}

export function CodeBlock({ code, format }: CodeBlockProps) {
  const formattedCode = useMemo(() => formatCode(code, format), [code, format]);
  const isCSV = format === 'CSV';
  const language = getLanguage(format);

  // Highlight code
  const highlightedCode = useMemo(() => {
    if (isCSV) return formattedCode;
    
    try {
      const grammar = Prism.languages[language] || Prism.languages.text;
      if (!grammar) return formattedCode;
      return Prism.highlight(formattedCode, grammar, language);
    } catch {
      return formattedCode;
    }
  }, [formattedCode, language, isCSV]);

  // Render CSV as a table
  if (isCSV) {
    return (
      <div className="bg-[#1e1e1e] h-full w-full">
        <CSVTable csv={formattedCode} />
      </div>
    );
  }

  // For other formats, use syntax-highlighted rendering
  return (
    <pre
      className="bg-[#1e1e1e] p-4 text-sm text-left w-full font-mono m-0 whitespace-pre-wrap"
      style={{ fontFamily: 'Consolas, Monaco, "Courier New", monospace' }}
    >
      <code
        className={`language-${language} block`}
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    </pre>
  );
}
