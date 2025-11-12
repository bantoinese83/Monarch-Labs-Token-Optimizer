import type { FormatName, AdvancedMetrics, DataTypeBreakdown, FormatAnalysis } from '@/types';

// Pre-compiled regexes for better performance
const STRING_REGEX = /"[^"]*"/g;
const NUMBER_REGEX = /\b\d+\.?\d*\b/g;
const ARRAY_OPEN_REGEX = /\[/g;
const OBJECT_OPEN_REGEX = /\{/g;
const BOOLEAN_REGEX = /\b(true|false)\b/g;
const NULL_REGEX = /\bnull\b/g;
const WHITESPACE_REGEX = /[\s\n\t\r]+/g;

export function calculateAdvancedMetrics(
  code: string,
  tokenBreakdown: { total: number; structure: number; data: number }
): AdvancedMetrics {
  const characterCount = code.length;

  // Avoid division by zero
  if (characterCount === 0 || tokenBreakdown.total === 0) {
    return {
      tokenDensity: 0,
      structureOverhead: 0,
      dataEfficiency: 0,
      formatComplexity: 0,
      compressionRatio: 0,
      savingsPercentage: 0,
      characterToTokenRatio: 0,
    };
  }

  const tokenDensity = tokenBreakdown.total / characterCount;
  const structureOverhead = (tokenBreakdown.structure / tokenBreakdown.total) * 100;
  const dataEfficiency = (tokenBreakdown.data / tokenBreakdown.total) * 100;
  const formatComplexity = structureOverhead * 0.4 + (1 - dataEfficiency / 100) * 60;
  const compressionRatio = characterCount / tokenBreakdown.total;
  const savingsPercentage = 0;
  const characterToTokenRatio = characterCount / tokenBreakdown.total;

  return {
    tokenDensity,
    structureOverhead,
    dataEfficiency,
    formatComplexity,
    compressionRatio,
    savingsPercentage,
    characterToTokenRatio,
  };
}

/**
 * Optimized data type breakdown using single-pass regex matching
 * O(n) time complexity where n is code length
 */
export function analyzeDataTypeBreakdown(code: string): DataTypeBreakdown {
  try {
    const parsed = JSON.parse(code);
    return analyzeObjectIterative(parsed);
  } catch {
    // Fallback to regex-based counting (single pass)
    // Reset regex lastIndex to ensure accurate counting
    STRING_REGEX.lastIndex = 0;
    NUMBER_REGEX.lastIndex = 0;
    ARRAY_OPEN_REGEX.lastIndex = 0;
    OBJECT_OPEN_REGEX.lastIndex = 0;
    BOOLEAN_REGEX.lastIndex = 0;
    NULL_REGEX.lastIndex = 0;

    return {
      strings: (code.match(STRING_REGEX) || []).length,
      numbers: (code.match(NUMBER_REGEX) || []).length,
      arrays: (code.match(ARRAY_OPEN_REGEX) || []).length,
      objects: (code.match(OBJECT_OPEN_REGEX) || []).length,
      booleans: (code.match(BOOLEAN_REGEX) || []).length,
      nulls: (code.match(NULL_REGEX) || []).length,
    };
  }
}

/**
 * Iterative approach to avoid stack overflow on deeply nested objects
 * Uses a stack instead of recursion for better performance and safety
 */
function analyzeObjectIterative(obj: unknown): DataTypeBreakdown {
  const breakdown: DataTypeBreakdown = {
    strings: 0,
    numbers: 0,
    arrays: 0,
    objects: 0,
    booleans: 0,
    nulls: 0,
  };

  // Use stack for iterative traversal (avoids recursion stack overflow)
  const stack: unknown[] = [obj];
  const visited = new WeakSet(); // Prevent circular reference issues

  while (stack.length > 0) {
    const current = stack.pop();

    if (current === null) {
      breakdown.nulls++;
      continue;
    }

    if (current === undefined) {
      continue;
    }

    const type = typeof current;

    if (type === 'string') {
      breakdown.strings++;
    } else if (type === 'number') {
      breakdown.numbers++;
    } else if (type === 'boolean') {
      breakdown.booleans++;
    } else if (Array.isArray(current)) {
      breakdown.arrays++;
      // Add array items to stack (reverse order to maintain processing order)
      for (let i = current.length - 1; i >= 0; i--) {
        stack.push(current[i]);
      }
    } else if (type === 'object') {
      // Check for circular references
      if (visited.has(current as object)) {
        continue;
      }
      visited.add(current as object);

      breakdown.objects++;
      // Add object values to stack
      const values = Object.values(current as Record<string, unknown>);
      for (let i = values.length - 1; i >= 0; i--) {
        stack.push(values[i]);
      }
    }
  }

  return breakdown;
}

/**
 * Optimized whitespace token counting using single regex pass
 */
export function countWhitespaceTokens(code: string): number {
  WHITESPACE_REGEX.lastIndex = 0;
  const matches = code.match(WHITESPACE_REGEX);
  if (!matches) return 0;

  // Sum lengths in single pass
  let total = 0;
  for (let i = 0; i < matches.length; i++) {
    total += matches[i]!.length;
  }
  return total;
}

/**
 * Optimized nesting depth calculation using single pass
 * O(n) time complexity where n is code length
 */
export function calculateNestingDepth(code: string): number {
  let maxDepth = 0;
  let currentDepth = 0;

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    if (char === '{' || char === '[') {
      currentDepth++;
      if (currentDepth > maxDepth) {
        maxDepth = currentDepth;
      }
    } else if (char === '}' || char === ']') {
      currentDepth--;
    }
  }

  return maxDepth;
}

export function generateFormatInsights(
  _formatName: FormatName,
  metrics: AdvancedMetrics,
  dataTypeBreakdown: DataTypeBreakdown,
  baselineTokens: number,
  currentTokens: number
): string[] {
  const insights: string[] = [];
  const diff = currentTokens - baselineTokens;
  const percentageDiff = baselineTokens > 0 ? (diff / baselineTokens) * 100 : 0;

  if (percentageDiff < -10) {
    insights.push(
      `Significantly more efficient than JSON (${Math.abs(percentageDiff).toFixed(1)}% savings)`
    );
  } else if (percentageDiff < 0) {
    insights.push(`More efficient than JSON (${Math.abs(percentageDiff).toFixed(1)}% savings)`);
  } else if (percentageDiff > 10) {
    insights.push(`Less efficient than JSON (+${percentageDiff.toFixed(1)}% overhead)`);
  }

  if (metrics.structureOverhead > 50) {
    insights.push('High structure overhead - consider data compression');
  }

  if (metrics.dataEfficiency > 70) {
    insights.push('High data efficiency - good for data-heavy payloads');
  }

  if (dataTypeBreakdown.arrays > dataTypeBreakdown.objects) {
    insights.push('Array-heavy structure - CSV or TOON may be optimal');
  }

  if (metrics.characterToTokenRatio > 4) {
    insights.push('Excellent character-to-token ratio');
  }

  return insights;
}

export function analyzeFormat(
  formatName: FormatName,
  code: string,
  tokenBreakdown: { total: number; structure: number; data: number },
  baselineTokens: number
): FormatAnalysis {
  const metrics = calculateAdvancedMetrics(code, tokenBreakdown);
  const dataTypeBreakdown = analyzeDataTypeBreakdown(code);
  const whitespaceTokens = countWhitespaceTokens(code);
  const nestingDepth = calculateNestingDepth(code);
  const insights = generateFormatInsights(
    formatName,
    metrics,
    dataTypeBreakdown,
    baselineTokens,
    tokenBreakdown.total
  );

  return {
    formatName,
    metrics,
    dataTypeBreakdown,
    whitespaceTokens,
    nestingDepth,
    insights,
  };
}
