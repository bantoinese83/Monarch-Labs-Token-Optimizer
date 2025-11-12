import { useMemo } from 'react';
import type { ComparisonResult } from '@/types';
import { ScoreWidget } from './ScoreWidget';

interface ScoreWidgetsProps {
  result: ComparisonResult;
}

export function ScoreWidgets({ result }: ScoreWidgetsProps) {
  const scores = useMemo(() => {
    const baseline = result.json.token_breakdown.total;
    const formats = ['csv', 'toon', 'yaml'] as const;

    // Calculate efficiency score (how much better than JSON, 0-100)
    const efficiencyScores = formats.map(format => {
      const formatData = result[format];
      const tokens = formatData.token_breakdown.total;
      const savings = baseline - tokens;
      const percentSavings = baseline > 0 ? (savings / baseline) * 100 : 0;
      // Convert to 0-100 scale where 0% savings = 0, 50% savings = 100
      const efficiency = Math.max(0, Math.min(100, (percentSavings + 50) * 2));
      return { format, efficiency, tokens, savings };
    });

    // Find best format
    const bestFormat = efficiencyScores.reduce((best, current) =>
      current.efficiency > best.efficiency ? current : best
    );

    // Calculate overall token efficiency (average of all formats)
    const avgEfficiency =
      efficiencyScores.reduce((sum, s) => sum + s.efficiency, 0) / efficiencyScores.length;

    // Calculate cost savings score (based on potential savings)
    const maxSavings = Math.max(...efficiencyScores.map(s => s.savings));
    const costSavingsScore = baseline > 0 ? Math.min(100, (maxSavings / baseline) * 100 * 2) : 0;

    return {
      efficiency: Math.round(avgEfficiency),
      bestFormat: {
        name: bestFormat.format.toUpperCase(),
        score: Math.round(bestFormat.efficiency),
        savings: bestFormat.savings,
      },
      costSavings: Math.round(costSavingsScore),
    };
  }, [result]);

  return (
    <div className="score-widgets-container">
      <ScoreWidget
        title="Token Efficiency"
        description="Average efficiency score across all formats compared to JSON baseline. Higher scores indicate better token optimization."
        score={scores.efficiency}
        maxScore={100}
      />
      <ScoreWidget
        title={`${scores.bestFormat.name} Performance`}
        description={`${scores.bestFormat.name} shows the best token efficiency, saving ${scores.bestFormat.savings} tokens compared to JSON. Higher score means better optimization.`}
        score={scores.bestFormat.score}
        maxScore={100}
      />
      <ScoreWidget
        title="Cost Savings Potential"
        description="Potential cost savings when using optimized formats at scale. Higher score indicates greater long-term savings for API usage."
        score={scores.costSavings}
        maxScore={100}
      />
    </div>
  );
}
