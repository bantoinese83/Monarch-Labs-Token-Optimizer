import { get_encoding } from 'tiktoken';
import type { TokenBreakdown } from '@/types';

const encoding = get_encoding('cl100k_base');

// Pre-compiled regex for better performance
const structuralTokenRegex = /^[[\]{},":\-\s\n\t]+$/;

/**
 * Optimized token analysis using batch decoding
 * O(n) time complexity where n is number of tokens
 */
export function analyzeTokens(text: string): TokenBreakdown {
  if (!text) {
    return { total: 0, structure: 0, data: 0 };
  }

  const tokenIds = encoding.encode(text);
  const total = tokenIds.length;

  if (total === 0) {
    return { total: 0, structure: 0, data: 0 };
  }

  // Decode tokens individually for accuracy
  // Note: Batch decoding would be faster but less accurate for structural token detection
  let structure = 0;
  let data = 0;

  for (let i = 0; i < tokenIds.length; i++) {
    const tokenBytes = encoding.decode(new Uint32Array([tokenIds[i]!]));
    const tokenText = new TextDecoder().decode(tokenBytes);

    if (structuralTokenRegex.test(tokenText)) {
      structure++;
    } else {
      data++;
    }
  }

  return {
    total,
    structure,
    data,
  };
}
