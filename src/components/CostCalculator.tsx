import { useState } from 'react';
import type { ComparisonResult, FormatName } from '@/types';
import { calculateCostsForAllFormats, calculateROI, API_PRICING } from '@/utils/costCalculator';
import { getModelLogo } from '@/utils/modelLogos';

interface CostCalculatorProps {
  result: ComparisonResult;
}

export function CostCalculator({ result }: CostCalculatorProps) {
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4-turbo');
  const [requestsPerMonth, setRequestsPerMonth] = useState<number>(1000);

  const pricing = API_PRICING[selectedModel];
  if (!pricing) return null;

  const costs = calculateCostsForAllFormats(result, selectedModel);
  const baseline = result.json.token_breakdown.total;

  const formats: FormatName[] = ['JSON', 'CSV', 'TOON', 'YAML'];

  return (
    <div className="bg-[#252526] border border-[#3e3e42]">
      <div className="bg-[#2d2d30] border-b border-[#3e3e42] px-4 py-2">
        <h3 className="text-sm font-medium text-[#cccccc]">Cost Calculator</h3>
      </div>

      <div className="p-3 sm:p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#858585] mb-1 uppercase">Model</label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full bg-[#3e3e42] text-[#cccccc] text-sm px-3 py-3 sm:py-2 pl-10 border border-[#3e3e42] focus:outline-none focus:border-[#007acc] min-h-[44px] sm:min-h-0 appearance-none cursor-pointer"
              >
                {Object.keys(API_PRICING).map(key => {
                  const modelPricing = API_PRICING[key];
                  if (!modelPricing) return null;
                  return (
                    <option key={key} value={key}>
                      {modelPricing.model} (${modelPricing.inputPricePer1M}/1M)
                    </option>
                  );
                })}
              </select>
              {getModelLogo(selectedModel) && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                  <img
                    src={getModelLogo(selectedModel)!}
                    alt=""
                    className="w-5 h-5 object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#858585] mb-1 uppercase">Requests/Month</label>
            <input
              type="number"
              value={requestsPerMonth}
              onChange={e => setRequestsPerMonth(Number(e.target.value))}
              min="1"
              className="w-full bg-[#3e3e42] text-[#cccccc] text-sm px-3 py-3 sm:py-2 border border-[#3e3e42] focus:outline-none focus:border-[#007acc] min-h-[44px] sm:min-h-0"
            />
          </div>
        </div>

        <div className="space-y-2">
          {formats.map(format => {
            const cost = costs[format];
            const roi =
              format !== 'JSON' && pricing
                ? calculateROI(baseline, cost.tokensUsed, requestsPerMonth, pricing)
                : null;

            return (
              <div key={format} className="bg-[#2d2d30] border border-[#3e3e42] p-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                  <span className="font-medium text-[#cccccc] text-sm">{format}</span>
                  <span
                    className={`text-xs ${cost.withinContextWindow ? 'text-[#4ec9b0]' : 'text-[#f48771]'}`}
                  >
                    {cost.withinContextWindow ? '✓' : '✗'}{' '}
                    {cost.withinContextWindow ? 'Within limit' : 'Exceeds limit'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#858585]">Per request:</span>
                    <span className="ml-2 text-[#cccccc] font-mono">
                      ${cost.totalCost.toFixed(6)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#858585]">Monthly:</span>
                    <span className="ml-2 text-[#cccccc] font-mono">
                      ${(cost.totalCost * requestsPerMonth).toFixed(2)}
                    </span>
                  </div>
                  {roi && (
                    <>
                      <div>
                        <span className="text-[#858585]">Monthly savings:</span>
                        <span className="ml-2 text-[#4ec9b0] font-mono">
                          ${roi.monthlySavings.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#858585]">Yearly savings:</span>
                        <span className="ml-2 text-[#4ec9b0] font-mono">
                          ${roi.yearlySavings.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-xs text-[#858585] pt-2 border-t border-[#3e3e42]">
          Context window: {pricing.contextWindow.toLocaleString()} tokens
        </div>
      </div>
    </div>
  );
}
