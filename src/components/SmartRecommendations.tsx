import { useMemo, useState, useEffect } from 'react';
import type { ComparisonResult } from '@/types';
import { CrownIcon, ChevronDownIcon } from './Icons';
import { getBestFormatRecommendation, getFormatRecommendations } from '@/utils/recommendations';
import { generateTip } from '@/utils/tipGenerator';

interface SmartRecommendationsProps {
  result: ComparisonResult;
  inputText?: string;
}

export function SmartRecommendations({ result, inputText = '' }: SmartRecommendationsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [scoreAnimation, setScoreAnimation] = useState(0);
  const [previousFormat, setPreviousFormat] = useState<string | null>(null);

  const recommendation = useMemo(() => {
    return getBestFormatRecommendation(result, inputText);
  }, [result, inputText]);

  const allRecommendations = useMemo(() => {
    return getFormatRecommendations(result, inputText);
  }, [result, inputText]);

  // Animate score on mount/change
  useEffect(() => {
    if (!recommendation) return;

    setIsVisible(false);
    setScoreAnimation(0);
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const timer = setTimeout(() => {
      setIsVisible(true);
      // Animate score from 0 to actual value
      const targetScore = recommendation.score;
      const duration = 1000; // 1 second
      const steps = 60;
      const increment = targetScore / steps;
      let current = 0;
      intervalId = setInterval(() => {
        current += increment;
        if (current >= targetScore) {
          setScoreAnimation(targetScore);
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        } else {
          setScoreAnimation(current);
        }
      }, duration / steps);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [recommendation?.format, recommendation]);

  // Track format changes for animation
  useEffect(() => {
    if (recommendation && recommendation.format !== previousFormat) {
      setPreviousFormat(recommendation.format);
      setIsExpanded(false); // Collapse when format changes
    }
  }, [recommendation?.format, previousFormat]);

  // Generate AI tip - must be called before early return (Rules of Hooks)
  const aiTip = useMemo(() => {
    if (!recommendation || recommendation.format === 'JSON') {
      return '';
    }

    const baseline = result.json.token_breakdown.total;
    const key = recommendation.format.toLowerCase() as keyof ComparisonResult;
    const data = result[key];
    const tokens = data.token_breakdown.total;
    const savings = baseline - tokens;
    const percentageSavings = baseline > 0 ? (savings / baseline) * 100 : 0;
    const structureRatio = data.token_breakdown.structure / tokens;
    const dataRatio = data.token_breakdown.data / tokens;

    const otherFormats = allRecommendations
      .filter(r => r.format !== recommendation.format)
      .sort((a, b) => b.score - a.score);

    const otherFormatsData = otherFormats.map(rec => {
      const recKey = rec.format.toLowerCase() as keyof ComparisonResult;
      const recData = result[recKey];
      return {
        format: rec.format,
        tokens: recData.token_breakdown.total,
        savings: baseline - recData.token_breakdown.total,
      };
    });

    return generateTip({
      format: recommendation.format,
      tokens,
      savings,
      percentageSavings,
      baselineTokens: baseline,
      structureRatio,
      dataRatio,
      inputText,
      otherFormats: otherFormatsData,
    });
  }, [recommendation, result, allRecommendations, inputText]);

  if (!recommendation) {
    return null;
  }

  const baseline = result.json.token_breakdown.total;
  const key = recommendation.format.toLowerCase() as keyof ComparisonResult;
  const data = result[key];
  const tokens = data.token_breakdown.total;
  const savings = baseline - tokens;
  const percentageSavings = baseline > 0 ? (savings / baseline) * 100 : 0;
  const best = recommendation;

  const savingsColor = percentageSavings > 10 ? 'text-[#4ec9b0]' : 'text-[#dcdcaa]';
  const badgeColor =
    best.format === 'CSV'
      ? 'bg-[#4ec9b0]'
      : best.format === 'TOON'
        ? 'bg-[#dcdcaa]'
        : best.format === 'YAML'
          ? 'bg-[#569cd6]'
          : 'bg-[#007acc]';

  // Sort other formats by score
  const otherFormats = allRecommendations
    .filter(r => r.format !== best.format)
    .sort((a, b) => b.score - a.score);

  return (
    <div
      className={`bg-[#252526] border-2 border-[#007acc] mb-6 transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
      style={{
        animation: isVisible ? 'slideInUp 0.5s ease-out' : 'none',
      }}
    >
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes scoreCount {
          from { transform: scale(0.8); }
          to { transform: scale(1); }
        }
        .score-animate {
          animation: scoreCount 0.3s ease-out;
        }
      `}</style>

      <div className="bg-[#2d2d30] border-b border-[#3e3e42] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CrownIcon className="w-4 h-4 text-[#dcdcaa] animate-pulse" />
          <h3 className="text-sm font-semibold text-[#cccccc]">Smart Recommendation</h3>
          {previousFormat && previousFormat !== best.format && (
            <span className="text-xs text-[#858585] ml-2 animate-pulse">
              Format changed!
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#858585] hover:text-[#cccccc] transition-colors flex items-center gap-1"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
          aria-expanded={isExpanded}
        >
          <span className="text-xs">Compare all formats</span>
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div
            className={`${badgeColor} text-[#1e1e1e] px-3 py-1.5 text-sm font-bold rounded transition-all duration-300 hover:scale-105 cursor-default`}
            style={{
              boxShadow: '0 0 10px rgba(0, 122, 204, 0.3)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            {best.format}
          </div>
          <div className="flex-1">
            <div className="text-sm text-[#cccccc] mb-1">
              <span className="font-semibold">Recommended Format</span>
              <span
                className={`ml-2 ${savingsColor} font-mono transition-all duration-300`}
                style={{
                  animation: isVisible ? 'pulse 1s ease-in-out 2' : 'none',
                }}
              >
                ({percentageSavings > 0 ? '-' : '+'}
                {Math.abs(percentageSavings).toFixed(1)}% vs JSON)
              </span>
            </div>
            <div className="text-xs text-[#858585]">{best.useCase}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-[#1e1e1e] border border-[#3e3e42] p-3 transition-all duration-300 hover:border-[#007acc]">
            <div className="text-xs text-[#858585] mb-1 uppercase">Token Count</div>
            <div className="text-lg font-mono text-[#cccccc] font-bold transition-all duration-300">
              {tokens.toLocaleString()}
            </div>
            <div className="text-xs text-[#858585] mt-1">
              Saves {savings.toLocaleString()} tokens
            </div>
          </div>
          <div className="bg-[#1e1e1e] border border-[#3e3e42] p-3 transition-all duration-300 hover:border-[#4ec9b0]">
            <div className="text-xs text-[#858585] mb-1 uppercase">Efficiency Score</div>
            <div
              className="text-lg font-mono text-[#4ec9b0] font-bold score-animate"
              key={scoreAnimation}
            >
              {Math.round(scoreAnimation).toLocaleString()}/100
            </div>
            <div className="text-xs text-[#858585] mt-1">Optimization rating</div>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 bg-[#3e3e42] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4ec9b0] transition-all duration-1000 ease-out"
                style={{ width: `${scoreAnimation}%` }}
              />
            </div>
          </div>
        </div>

        {best.reasons.length > 0 && (
          <div className="transition-all duration-300">
            <div className="text-xs text-[#858585] mb-2 uppercase font-semibold">
              Why {best.format}?
            </div>
            <ul className="space-y-1.5">
              {best.reasons.map((reason, idx) => (
                <li
                  key={idx}
                  className="text-sm text-[#cccccc] flex items-start gap-2 transition-all duration-300 hover:text-[#ffffff]"
                  style={{
                    animationDelay: `${idx * 0.1}s`,
                    animation: isVisible ? 'slideInUp 0.4s ease-out forwards' : 'none',
                    opacity: isVisible ? 1 : 0,
                  }}
                >
                  <span className="text-[#4ec9b0] mt-1 flex-shrink-0">✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {best.bestFor.length > 0 && (
          <div className="transition-all duration-300">
            <div className="text-xs text-[#858585] mb-2 uppercase font-semibold">Best For</div>
            <div className="flex flex-wrap gap-2">
              {best.bestFor.map((useCase: string, idx: number) => (
                <span
                  key={idx}
                  className="bg-[#0e639c] text-[#cccccc] px-2 py-1 text-xs border border-[#007acc] transition-all duration-300 hover:bg-[#1177bb] hover:scale-105 cursor-default"
                  style={{
                    animationDelay: `${idx * 0.05}s`,
                    animation: isVisible ? 'slideInUp 0.3s ease-out forwards' : 'none',
                    opacity: isVisible ? 1 : 0,
                  }}
                >
                  {useCase}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expandable comparison view */}
        {isExpanded && (
          <div
            className="pt-4 border-t border-[#3e3e42] space-y-3 transition-all duration-500"
            style={{
              animation: 'slideInUp 0.3s ease-out',
            }}
          >
            <div className="text-xs text-[#858585] uppercase font-semibold mb-2">
              All Format Comparison
            </div>
            <div className="space-y-2">
              {otherFormats.map((rec, idx) => {
                const recKey = rec.format.toLowerCase() as keyof ComparisonResult;
                const recData = result[recKey];
                const recTokens = recData.token_breakdown.total;
                const recSavings = baseline - recTokens;
                const recPercentage = baseline > 0 ? (recSavings / baseline) * 100 : 0;
                const recBadgeColor =
                  rec.format === 'CSV'
                    ? 'bg-[#4ec9b0]'
                    : rec.format === 'TOON'
                      ? 'bg-[#dcdcaa]'
                      : rec.format === 'YAML'
                        ? 'bg-[#569cd6]'
                        : 'bg-[#007acc]';

                return (
                  <div
                    key={rec.format}
                    className="bg-[#1e1e1e] border border-[#3e3e42] p-3 rounded transition-all duration-300 hover:border-[#3e3e42] hover:bg-[#252526]"
                    style={{
                      animationDelay: `${idx * 0.1}s`,
                      animation: 'slideInUp 0.3s ease-out forwards',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`${recBadgeColor} text-[#1e1e1e] px-2 py-1 text-xs font-bold rounded`}
                        >
                          {rec.format}
                        </span>
                        <span className="text-xs text-[#858585]">{rec.useCase}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono text-[#cccccc] font-bold">
                          {recTokens.toLocaleString()} tokens
                        </div>
                        <div
                          className={`text-xs font-mono ${
                            recPercentage > 0 ? 'text-[#4ec9b0]' : 'text-[#858585]'
                          }`}
                        >
                          {recPercentage > 0 ? '-' : '+'}
                          {Math.abs(recPercentage).toFixed(1)}% vs JSON
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-[#3e3e42] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#007acc] transition-all duration-500"
                          style={{ width: `${rec.score}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#858585] font-mono">
                        {rec.score.toFixed(0)}/100
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-[#3e3e42]">
          <div className="text-xs text-[#858585] leading-relaxed">
            <span className="font-semibold text-[#cccccc]">Tip:</span>{' '}
            <span className="text-[#cccccc]">{aiTip}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
