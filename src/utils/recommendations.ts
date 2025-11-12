import type { ComparisonResult, FormatName } from '@/types';

export interface FormatRecommendation {
  format: FormatName;
  score: number;
  reasons: string[];
  useCase: string;
  estimatedSavings: number;
  bestFor: string[];
}

/**
 * Analyzes comparison results and provides intelligent format recommendations
 * based on data structure, token efficiency, and use case patterns
 */
export function getFormatRecommendations(
  result: ComparisonResult,
  inputText: string
): FormatRecommendation[] {
  const baseline = result.json.token_breakdown.total;
  const formats: FormatName[] = ['JSON', 'CSV', 'TOON', 'YAML'];

  // Analyze input text for context clues
  const inputLower = inputText.toLowerCase();
  const isTabular = inputLower.includes('table') || inputLower.includes('row') || inputLower.includes('column');
  const isNested = inputLower.includes('nested') || inputLower.includes('hierarchical') || inputLower.includes('tree');
  const isConfig = inputLower.includes('config') || inputLower.includes('setting') || inputLower.includes('preference');
  const isApi = inputLower.includes('api') || inputLower.includes('request') || inputLower.includes('response');

  return formats.map(format => {
    const key = format.toLowerCase() as keyof ComparisonResult;
    const data = result[key];
    const tokens = data.token_breakdown.total;
    const savings = baseline - tokens;
    const percentageSavings = baseline > 0 ? (savings / baseline) * 100 : 0;

    const reasons: string[] = [];
    const bestFor: string[] = [];
    let score = 0;
    let useCase = '';

    // Calculate efficiency metrics
    const structureRatio = data.token_breakdown.structure / tokens;
    const dataRatio = data.token_breakdown.data / tokens;
    const codeLength = data.code.length;
    const compactness = codeLength / tokens;

    switch (format) {
      case 'CSV':
        score = percentageSavings * 2;
        if (dataRatio > 0.7) {
          score += 25;
          reasons.push('Excellent data-to-structure ratio (70%+ data)');
        }
        if (structureRatio < 0.3) {
          score += 20;
          reasons.push('Minimal structural overhead (<30%)');
        }
        if (compactness < 3) {
          score += 15;
          reasons.push('Highly compact representation');
        }
        if (isTabular) {
          score += 30;
          reasons.push('Perfect for tabular/row-based data');
        }
        if (percentageSavings > 10) {
          reasons.push(`Significant token savings: ${percentageSavings.toFixed(1)}%`);
        }
        useCase = 'Tabular data, spreadsheets, bulk data operations';
        bestFor.push('Data exports', 'Spreadsheet imports', 'Bulk data transfer', 'Simple records');
        break;

      case 'TOON':
        score = percentageSavings * 2.5;
        if (dataRatio > 0.65) {
          score += 30;
          reasons.push('High data efficiency (65%+ data)');
        }
        if (compactness < 2.5) {
          score += 25;
          reasons.push('Extremely compact format');
        }
        if (isNested) {
          score += 35;
          reasons.push('Optimized for nested/hierarchical structures');
        }
        if (isApi) {
          score += 20;
          reasons.push('Ideal for API payloads');
        }
        if (percentageSavings > 15) {
          reasons.push(`Excellent token efficiency: ${percentageSavings.toFixed(1)}% savings`);
        }
        useCase = 'Nested data structures, API payloads, hierarchical data';
        bestFor.push('API requests', 'Nested objects', 'Complex structures', 'Performance-critical apps');
        break;

      case 'YAML':
        score = percentageSavings * 1.5;
        if (structureRatio < 0.4) {
          score += 15;
          reasons.push('Low structural overhead');
        }
        if (isConfig) {
          score += 30;
          reasons.push('Perfect for configuration files');
        }
        if (compactness < 3.5) {
          score += 10;
          reasons.push('Readable and compact');
        }
        if (percentageSavings > 5) {
          reasons.push(`Token savings: ${percentageSavings.toFixed(1)}%`);
        }
        useCase = 'Configuration files, human-readable data, documentation';
        bestFor.push('Config files', 'Documentation', 'Human editing', 'Readable formats');
        break;

      case 'JSON':
        score = 50; // Baseline score
        reasons.push('Universal compatibility');
        reasons.push('Standard for web APIs');
        if (isApi) {
          score += 20;
          reasons.push('Industry standard for API communication');
        }
        useCase = 'APIs, web services, general-purpose data exchange';
        bestFor.push('Web APIs', 'General use', 'Maximum compatibility', 'Standard format');
        break;
    }

    return {
      format,
      score: Math.max(0, Math.min(100, score)),
      reasons,
      useCase,
      estimatedSavings: savings,
      bestFor,
    };
  });
}

/**
 * Gets the best format recommendation based on analysis
 * Prefers non-JSON formats when they have any savings
 */
export function getBestFormatRecommendation(
  result: ComparisonResult,
  inputText: string
): FormatRecommendation | null {
  const recommendations = getFormatRecommendations(result, inputText);
  
  // Filter out JSON and find the best non-JSON format
  const nonJsonRecommendations = recommendations.filter(r => r.format !== 'JSON');
  
  if (nonJsonRecommendations.length === 0) {
    return null;
  }
  
  // Sort by score (highest first)
  const sorted = nonJsonRecommendations.sort((a, b) => b.score - a.score);
  
  // If the best format has positive savings, return it
  const best = sorted[0]!;
  if (best.estimatedSavings > 0) {
    return best;
  }
  
  // If no format has savings, return the one with highest score anyway
  return best;
}

