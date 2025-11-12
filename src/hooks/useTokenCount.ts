import { useState, useEffect } from 'react';
import { analyzeTokens } from '@/utils/tokenizer';
import { tokenCountCache, hashString } from '@/services/cache';

export function useTokenCount(text: string) {
  const [tokenCount, setTokenCount] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!text.trim()) {
      setTokenCount(0);
      setIsCalculating(false);
      return;
    }

    // Check cache first
    const cacheKey = hashString(text.trim());
    const cached = tokenCountCache.get(cacheKey);

    if (cached !== null) {
      setTokenCount(cached);
      setIsCalculating(false);
      return;
    }

    setIsCalculating(true);
    const timeoutId = setTimeout(() => {
      try {
        const breakdown = analyzeTokens(text);
        const count = breakdown.total;
        setTokenCount(count);
        // Cache the result
        tokenCountCache.set(cacheKey, count);
      } catch {
        setTokenCount(0);
      } finally {
        setIsCalculating(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [text]);

  return { tokenCount, isCalculating };
}
