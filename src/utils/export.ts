import type { ComparisonResult, FormatName, ComparisonSummary } from '@/types';

export function exportToCSV(result: ComparisonResult, inputText: string): string {
  const headers = ['Format', 'Total Tokens', 'Structure Tokens', 'Data Tokens', 'Code'];
  const rows: string[] = [headers.join(',')];

  const formats: FormatName[] = ['JSON', 'CSV', 'TOON', 'YAML'];

  formats.forEach(format => {
    const key = format.toLowerCase() as keyof ComparisonResult;
    const data = result[key];
    const codeEscaped = `"${data.code.replace(/"/g, '""')}"`;
    rows.push(
      [
        format,
        data.token_breakdown.total.toString(),
        data.token_breakdown.structure.toString(),
        data.token_breakdown.data.toString(),
        codeEscaped,
      ].join(',')
    );
  });

  return `Input: ${inputText}\n\n${rows.join('\n')}`;
}

export function exportToJSON(result: ComparisonResult, inputText: string): string {
  return JSON.stringify(
    {
      input: inputText,
      timestamp: new Date().toISOString(),
      results: result,
    },
    null,
    2
  );
}

export function exportToMarkdown(result: ComparisonResult, inputText: string): string {
  const formats: FormatName[] = ['JSON', 'CSV', 'TOON', 'YAML'];
  const baseline = result.json.token_breakdown.total;

  let markdown = `# Token Comparison Results\n\n`;
  markdown += `**Input:** ${inputText}\n\n`;
  markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `| Format | Tokens | Difference | Savings |\n`;
  markdown += `|--------|--------|------------|----------|\n`;

  formats.forEach(format => {
    const key = format.toLowerCase() as keyof ComparisonResult;
    const data = result[key];
    const diff = data.token_breakdown.total - baseline;
    const percentage = baseline > 0 ? ((diff / baseline) * 100).toFixed(1) : '0.0';
    const savings = diff < 0 ? Math.abs(diff) : 0;
    markdown += `| ${format} | ${data.token_breakdown.total} | ${diff >= 0 ? '+' : ''}${diff} (${percentage}%) | ${savings} |\n`;
  });

  markdown += `\n## Detailed Breakdown\n\n`;

  formats.forEach(format => {
    const key = format.toLowerCase() as keyof ComparisonResult;
    const data = result[key];
    markdown += `### ${format}\n\n`;
    markdown += `- **Total Tokens:** ${data.token_breakdown.total}\n`;
    markdown += `- **Structure Tokens:** ${data.token_breakdown.structure}\n`;
    markdown += `- **Data Tokens:** ${data.token_breakdown.data}\n\n`;
    markdown += `\`\`\`\n${data.code}\n\`\`\`\n\n`;
  });

  return markdown;
}

export function generateShareableLink(result: ComparisonResult, inputText: string): string {
  const data = {
    input: inputText,
    result: result,
    timestamp: Date.now(),
  };
  const encoded = btoa(JSON.stringify(data));
  return `${window.location.origin}${window.location.pathname}?share=${encoded}`;
}

export function parseShareableLink(
  encoded: string
): { input: string; result: ComparisonResult } | null {
  try {
    const decoded = JSON.parse(atob(encoded));
    return {
      input: decoded.input,
      result: decoded.result,
    };
  } catch {
    return null;
  }
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function generateComparisonSummary(result: ComparisonResult): ComparisonSummary[] {
  const formats: FormatName[] = ['JSON', 'CSV', 'TOON', 'YAML'];
  const baseline = result.json.token_breakdown.total;

  return formats.map(format => {
    const key = format.toLowerCase() as keyof ComparisonResult;
    const data = result[key];
    const diff = data.token_breakdown.total - baseline;
    const percentageDiff = baseline > 0 ? (diff / baseline) * 100 : 0;
    const savings = diff < 0 ? Math.abs(diff) : 0;
    const efficiency = baseline > 0 ? (baseline / data.token_breakdown.total) * 100 : 100;

    return {
      format,
      tokens: data.token_breakdown.total,
      percentageDiff,
      savings,
      cost: 0,
      efficiency,
    };
  });
}
