import { useState } from 'react';
import type { ComparisonResult } from '@/types';
import { generateComparisonSummary } from '@/utils/export';
import { calculateCostsForAllFormats, API_PRICING } from '@/utils/costCalculator';
import { getModelLogo } from '@/utils/modelLogos';

interface SummaryTableProps {
  result: ComparisonResult;
  showCost?: boolean;
}

export function SummaryTable({ result, showCost = false }: SummaryTableProps) {
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4-turbo');
  const summary = generateComparisonSummary(result);

  let costs: ReturnType<typeof calculateCostsForAllFormats> | null = null;
  try {
    costs = showCost ? calculateCostsForAllFormats(result, selectedModel) : null;
  } catch {
    costs = null;
  }

  const sortedSummary = [...summary].sort((a, b) => a.tokens - b.tokens);

  return (
    <div className="bg-[#252526] border border-[#3e3e42] overflow-x-auto">
      <div className="bg-[#2d2d30] border-b border-[#3e3e42] px-2 sm:px-4 py-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h3 className="text-xs sm:text-sm font-medium text-[#cccccc]">Comparison Summary</h3>
        {showCost && (
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="w-full sm:w-auto bg-[#3e3e42] text-[#cccccc] text-xs px-2 py-2 sm:py-1 pl-8 border border-[#3e3e42] focus:outline-none focus:border-[#007acc] min-h-[44px] sm:min-h-0 appearance-none cursor-pointer"
            >
              {Object.keys(API_PRICING).map(key => {
                const modelPricing = API_PRICING[key];
                if (!modelPricing) return null;
                return (
                  <option key={key} value={key}>
                    {modelPricing.model}
                  </option>
                );
              })}
            </select>
            {getModelLogo(selectedModel) && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                <img
                  src={getModelLogo(selectedModel)!}
                  alt=""
                  className="w-4 h-4 object-contain"
                />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="p-2 sm:p-4">
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full text-xs sm:text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-[#3e3e42]">
                <th className="text-left py-2 px-2 sm:px-3 text-[#858585] text-xs font-medium uppercase">
                  Format
                </th>
                <th className="text-right py-2 px-2 sm:px-3 text-[#858585] text-xs font-medium uppercase">
                  Tokens
                </th>
                <th className="text-right py-2 px-2 sm:px-3 text-[#858585] text-xs font-medium uppercase">
                  Difference
                </th>
                <th className="text-right py-2 px-2 sm:px-3 text-[#858585] text-xs font-medium uppercase">
                  Savings
                </th>
                <th className="text-right py-2 px-2 sm:px-3 text-[#858585] text-xs font-medium uppercase">
                  Efficiency
                </th>
                {showCost && costs && (
                  <th className="text-right py-2 px-2 sm:px-3 text-[#858585] text-xs font-medium uppercase">
                    Cost ($)
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedSummary.map(item => {
                const cost = costs?.[item.format];
                return (
                  <tr key={item.format} className="border-b border-[#3e3e42] hover:bg-[#2a2d2e]">
                    <td className="py-2 px-2 sm:px-3 font-medium text-[#cccccc]">{item.format}</td>
                    <td className="text-right py-2 px-2 sm:px-3 text-[#cccccc] font-mono">
                      {item.tokens.toLocaleString()}
                    </td>
                    <td
                      className={`text-right py-2 px-2 sm:px-3 font-mono ${
                        item.percentageDiff < 0
                          ? 'text-[#4ec9b0]'
                          : item.percentageDiff > 0
                            ? 'text-[#f48771]'
                            : 'text-[#cccccc]'
                      }`}
                    >
                      {item.percentageDiff > 0 ? '+' : ''}
                      {item.percentageDiff.toFixed(1)}%
                    </td>
                    <td className="text-right py-2 px-2 sm:px-3 text-[#4ec9b0] font-mono">
                      {item.savings > 0 ? `-${item.savings.toLocaleString()}` : '-'}
                    </td>
                    <td className="text-right py-2 px-2 sm:px-3 text-[#cccccc] font-mono">
                      {item.efficiency.toFixed(1)}%
                    </td>
                    {showCost && cost && (
                      <td className="text-right py-2 px-2 sm:px-3 text-[#cccccc] font-mono">
                        ${cost.totalCost.toFixed(6)}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
