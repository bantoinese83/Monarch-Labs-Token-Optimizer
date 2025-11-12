import type { FormatName, TokenBreakdown, CostEstimate } from '@/types';
import { CodeBlock } from './CodeBlock';
import { CopyCodeButton } from './ExportButtons';
import { getModelLogo } from '@/utils/modelLogos';
import { UI_SIZES } from '@/constants';

interface ResultCardProps {
  formatName: FormatName;
  code: string;
  tokenBreakdown: TokenBreakdown;
  baselineTokenCount: number;
  costEstimates?: Record<string, CostEstimate>;
}

export function ResultCard({
  formatName,
  code,
  tokenBreakdown,
  baselineTokenCount,
  costEstimates,
}: ResultCardProps) {
  const isBaseline = formatName === 'JSON';
  const tokenDiff = tokenBreakdown.total - baselineTokenCount;
  const percentageDiff =
    isBaseline || baselineTokenCount === 0 ? 0 : (tokenDiff / baselineTokenCount) * 100;

  const getPercentageColor = () => {
    if (isBaseline || Math.abs(percentageDiff) < 0.01) return 'text-[#cccccc]';
    return percentageDiff < 0 ? 'text-[#4ec9b0]' : 'text-[#f48771]';
  };

  const formattedPercentage = () => {
    const sign = percentageDiff > 0 ? '+' : '';
    return `${sign}${percentageDiff.toFixed(0)}%`;
  };

  const totalTokens = tokenBreakdown.total;
  const structurePercentage = totalTokens > 0 ? (tokenBreakdown.structure / totalTokens) * 100 : 0;
  const dataPercentage = totalTokens > 0 ? (tokenBreakdown.data / totalTokens) * 100 : 0;

  return (
    <div
      className="flex flex-col bg-[#252526] border border-[#3e3e42] overflow-hidden"
      style={{ height: `${UI_SIZES.RESULT_CARD_HEIGHT}px` }}
    >
      {/* Tab-like Header */}
      <div className="bg-[#2d2d30] border-b border-[#3e3e42] px-2 sm:px-3 py-2 flex items-center justify-between flex-shrink-0">
        <span className="text-xs sm:text-sm font-medium text-[#cccccc]">{formatName}</span>
        <div className="flex items-center gap-1 sm:gap-2">
          <span className={`text-xs font-mono font-bold ${getPercentageColor()}`}>
            {tokenBreakdown.total.toLocaleString()}
          </span>
          {!isBaseline && (
            <span className={`text-xs font-mono ${getPercentageColor()}`}>
              {formattedPercentage()}
            </span>
          )}
        </div>
      </div>

      {/* Code Editor Area - Scrollable */}
      <div
        className="flex-1 bg-[#1e1e1e] relative overflow-y-auto overflow-x-auto"
        style={{ minHeight: `${UI_SIZES.RESULT_CARD_CODE_AREA_MIN_HEIGHT}px` }}
      >
        <div className="absolute top-2 right-2 z-10">
          <CopyCodeButton code={code} />
        </div>
        <CodeBlock code={code} format={formatName} />
      </div>

      {/* Token Breakdown Panel */}
      <div className="bg-[#252526] border-t border-[#3e3e42] p-3 flex-shrink-0">
        <div className="mb-2">
          <div className="text-xs text-[#858585] mb-1">Token Breakdown</div>
          <div
            className="w-full bg-[#1e1e1e] h-2 flex overflow-hidden border border-[#3e3e42]"
            title={`Structure: ${structurePercentage.toFixed(1)}%, Data: ${dataPercentage.toFixed(1)}%`}
            role="progressbar"
            aria-valuenow={tokenBreakdown.structure}
            aria-valuemin={0}
            aria-valuemax={totalTokens}
          >
            <div
              className="bg-[#569cd6] h-full transition-all duration-300"
              style={{ width: `${structurePercentage}%` }}
            />
            <div
              className="bg-[#4ec9b0] h-full transition-all duration-300"
              style={{ width: `${dataPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs mb-2">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <div className="w-2 h-2 bg-[#569cd6] flex-shrink-0" />
            <span className="text-[#858585] truncate">Structure:</span>
            <span className="text-[#cccccc] font-mono font-bold flex-shrink-0">
              {tokenBreakdown.structure.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <div className="w-2 h-2 bg-[#4ec9b0] flex-shrink-0" />
            <span className="text-[#858585] truncate">Data:</span>
            <span className="text-[#cccccc] font-mono font-bold flex-shrink-0">
              {tokenBreakdown.data.toLocaleString()}
            </span>
          </div>
        </div>

        {costEstimates && Object.keys(costEstimates).length > 0 && (
          <div className="border-t border-[#3e3e42] pt-2 mt-2">
            <div className="text-xs text-[#858585] mb-2 font-medium">
              Cost Estimates (per request)
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {Object.entries(costEstimates)
                .sort(([, a], [, b]) => a.totalCost - b.totalCost)
                .map(([key, estimate]) => {
                  const logo = getModelLogo(key);
                  return (
                    <div key={key} className="flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {logo && (
                          <img
                            src={logo}
                            alt=""
                            className="w-4 h-4 object-contain flex-shrink-0"
                          />
                        )}
                        <span className="text-[#858585] truncate">{estimate.model}:</span>
                        {!estimate.withinContextWindow && (
                          <div title="Exceeds context window" className="flex-shrink-0">
                            <svg
                              className="w-3 h-3 text-[#dcdcaa]"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="text-[#cccccc] font-mono font-bold flex-shrink-0">
                        ${estimate.totalCost.toFixed(6)}
                      </span>
                    </div>
                  );
                })}
            </div>
            <div className="text-[10px] text-[#858585] mt-2 italic">
              See Cost tab for detailed breakdown
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
