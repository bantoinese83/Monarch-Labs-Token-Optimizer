import type { ComparisonResult, FormatName } from '@/types';
import { analyzeFormat } from '@/utils/analytics';

interface AdvancedAnalysisProps {
  result: ComparisonResult;
}

export function AdvancedAnalysis({ result }: AdvancedAnalysisProps) {
  const formats: FormatName[] = ['JSON', 'CSV', 'TOON', 'YAML'];
  const baseline = result.json.token_breakdown.total;

  const analyses = formats.map(format => {
    const key = format.toLowerCase() as keyof ComparisonResult;
    const data = result[key];
    return analyzeFormat(format, data.code, data.token_breakdown, baseline);
  });

  return (
    <div className="space-y-4">
      {analyses.map(analysis => (
        <div key={analysis.formatName} className="bg-[#252526] border border-[#3e3e42]">
          <div className="bg-[#2d2d30] border-b border-[#3e3e42] px-3 sm:px-4 py-2">
            <h4 className="font-medium text-[#cccccc] text-xs sm:text-sm">{analysis.formatName}</h4>
          </div>
          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
              <div>
                <div className="text-xs text-[#858585] mb-1 uppercase">Token Density</div>
                <div className="text-base sm:text-lg font-mono text-[#cccccc]">
                  {analysis.metrics.tokenDensity.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#858585] mb-1 uppercase">Structure Overhead</div>
                <div className="text-base sm:text-lg font-mono text-[#cccccc]">
                  {analysis.metrics.structureOverhead.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-[#858585] mb-1 uppercase">Data Efficiency</div>
                <div className="text-base sm:text-lg font-mono text-[#cccccc]">
                  {analysis.metrics.dataEfficiency.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-[#858585] mb-1 uppercase">Char/Token Ratio</div>
                <div className="text-base sm:text-lg font-mono text-[#cccccc]">
                  {analysis.metrics.characterToTokenRatio.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-[#858585] mb-2 uppercase">Data Type Breakdown</div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-[#0e639c] text-[#cccccc] px-2 py-1 border border-[#007acc]">
                  Strings: {analysis.dataTypeBreakdown.strings}
                </span>
                <span className="bg-[#0e639c] text-[#cccccc] px-2 py-1 border border-[#007acc]">
                  Numbers: {analysis.dataTypeBreakdown.numbers}
                </span>
                <span className="bg-[#0e639c] text-[#cccccc] px-2 py-1 border border-[#007acc]">
                  Arrays: {analysis.dataTypeBreakdown.arrays}
                </span>
                <span className="bg-[#0e639c] text-[#cccccc] px-2 py-1 border border-[#007acc]">
                  Objects: {analysis.dataTypeBreakdown.objects}
                </span>
              </div>
            </div>

            {analysis.insights.length > 0 && (
              <div>
                <div className="text-xs text-[#858585] mb-2 uppercase">Insights</div>
                <ul className="list-disc list-inside space-y-1 text-sm text-[#cccccc]">
                  {analysis.insights.map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
