import type { FormatName } from '@/types';

interface TipContext {
  format: FormatName;
  tokens: number;
  savings: number;
  percentageSavings: number;
  baselineTokens: number;
  structureRatio: number;
  dataRatio: number;
  inputText: string;
  otherFormats: Array<{
    format: FormatName;
    tokens: number;
    savings: number;
  }>;
}

/**
 * Generates contextual, AI-style tips based on comparison results
 */
export function generateTip(context: TipContext): string {
  const {
    format,
    tokens,
    savings,
    percentageSavings,
    baselineTokens,
    structureRatio,
    dataRatio,
    inputText,
    otherFormats,
  } = context;

  const tips: string[] = [];

  // High savings tip
  if (percentageSavings > 20) {
    tips.push(
      `Using ${format} saves ${percentageSavings.toFixed(1)}% tokens compared to JSON. At scale, this could reduce API costs by ${
        Math.round(percentageSavings)
      }% or more.`
    );
  } else if (percentageSavings > 10) {
    tips.push(
      `${format} offers ${percentageSavings.toFixed(1)}% token savings over JSON, making it cost-effective for high-volume API calls.`
    );
  } else if (percentageSavings > 0) {
    tips.push(
      `${format} provides ${percentageSavings.toFixed(1)}% token reduction. While modest, this adds up significantly over thousands of requests.`
    );
  }

  // Structure efficiency tip
  if (structureRatio < 0.25) {
    tips.push(
      `With only ${(structureRatio * 100).toFixed(0)}% structural overhead, ${format} maximizes data density - ideal for bandwidth-constrained environments.`
    );
  } else if (structureRatio > 0.5) {
    tips.push(
      `${format} has ${(structureRatio * 100).toFixed(0)}% structural overhead. Consider data compression or schema optimization to reduce token count further.`
    );
  }

  // Data efficiency tip
  if (dataRatio > 0.75) {
    tips.push(
      `${format} achieves ${(dataRatio * 100).toFixed(0)}% data efficiency - excellent for data-heavy payloads where every token counts.`
    );
  }

  // Format-specific tips
  switch (format) {
    case 'CSV':
      if (inputText.toLowerCase().includes('table') || inputText.toLowerCase().includes('row')) {
        tips.push(
          `CSV is perfect for tabular data structures. Consider using it for bulk data exports, spreadsheet integrations, or simple record-based APIs.`
        );
      } else {
        tips.push(
          `CSV excels at flat, tabular data. If your data has nested structures, consider flattening or using TOON format instead.`
        );
      }
      break;

    case 'TOON':
      if (inputText.toLowerCase().includes('nested') || inputText.toLowerCase().includes('hierarchical')) {
        tips.push(
          `TOON is optimized for nested and hierarchical data structures. It maintains readability while minimizing token overhead.`
        );
      } else {
        tips.push(
          `TOON provides excellent compression for complex data structures. Consider it for API payloads where both size and readability matter.`
        );
      }
      break;

    case 'YAML':
      if (inputText.toLowerCase().includes('config') || inputText.toLowerCase().includes('setting')) {
        tips.push(
          `YAML is ideal for configuration files and human-readable data. Its clean syntax makes it perfect for settings, preferences, or documentation.`
        );
      } else {
        tips.push(
          `YAML balances readability with efficiency. Use it when you need human-editable formats without excessive token overhead.`
        );
      }
      break;

    case 'JSON':
      tips.push(
        `JSON remains the standard for web APIs due to universal support. Consider alternative formats only if token efficiency is critical.`
      );
      break;
  }

  // Comparison tip
  const secondBest = otherFormats
    .filter(f => f.format !== format)
    .sort((a, b) => b.savings - a.savings)[0];

  if (secondBest && secondBest.savings > 0) {
    const diff = savings - secondBest.savings;
    if (diff > baselineTokens * 0.05) {
      tips.push(
        `${format} outperforms ${secondBest.format} by ${diff.toLocaleString()} tokens (${((diff / baselineTokens) * 100).toFixed(1)}%), making it the clear choice for this data structure.`
      );
    }
  }

  // Scale tip
  if (tokens < 100) {
    tips.push(
      `With ${tokens} tokens, this payload is compact. The ${format} format ensures minimal overhead for small data structures.`
    );
  } else if (tokens > 1000) {
    tips.push(
      `At ${tokens.toLocaleString()} tokens, using ${format} can significantly reduce costs. For 10,000 API calls, you'd save approximately ${(savings * 10000).toLocaleString()} tokens.`
    );
  }

  // Context-aware tip based on input
  const inputLower = inputText.toLowerCase();
  if (inputLower.includes('api') || inputLower.includes('request')) {
    tips.push(
      `For API integrations, ${format} reduces payload size, leading to faster response times and lower bandwidth costs.`
    );
  }

  if (inputLower.includes('storage') || inputLower.includes('database')) {
    tips.push(
      `${format}'s compact representation makes it efficient for storage, reducing database size and improving query performance.`
    );
  }

  // Return the most relevant tip (prioritize high savings and format-specific)
  if (tips.length === 0) {
    return `${format} is a solid choice for this data structure. Consider your specific use case when choosing between formats.`;
  }

  // Prioritize tips: high savings > format-specific > general
  const prioritizedTips = tips.sort((a, b) => {
    const aScore = a.includes(percentageSavings.toFixed(1)) ? 3 : a.includes(format) ? 2 : 1;
    const bScore = b.includes(percentageSavings.toFixed(1)) ? 3 : b.includes(format) ? 2 : 1;
    return bScore - aScore;
  });

  return prioritizedTips[0] || tips[0]!;
}

