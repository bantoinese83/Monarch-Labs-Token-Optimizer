import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { useState } from 'react';
import type { ComparisonResult, FormatName } from '@/types';
import { BarChartIcon, PieChartIcon } from './Icons';

interface ComparisonChartProps {
  result: ComparisonResult;
  showStructure?: boolean;
}

type ChartType = 'bar' | 'pie';

export function ComparisonChart({ result, showStructure = false }: ComparisonChartProps) {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const formats: FormatName[] = ['JSON', 'CSV', 'TOON', 'YAML'];
  const baseline = result.json.token_breakdown.total;

  const barData = formats.map(format => {
    const key = format.toLowerCase() as keyof ComparisonResult;
    const data = result[key];
    const diff = data.token_breakdown.total - baseline;
    const percentageDiff = baseline > 0 ? (diff / baseline) * 100 : 0;

    return {
      format,
      total: data.token_breakdown.total,
      structure: data.token_breakdown.structure,
      data: data.token_breakdown.data,
      difference: diff,
      percentageDiff: Number(percentageDiff.toFixed(1)),
    };
  });

  const pieData = formats.map(format => {
    const key = format.toLowerCase() as keyof ComparisonResult;
    const data = result[key];
    return {
      id: format,
      label: format,
      value: data.token_breakdown.total,
      structure: data.token_breakdown.structure,
      data: data.token_breakdown.data,
    };
  });

  const theme = {
    background: '#1e1e1e',
    text: {
      fontSize: 12,
      fill: '#cccccc',
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
    },
    axis: {
      domain: {
        line: {
          stroke: '#3e3e42',
          strokeWidth: 1,
        },
      },
      ticks: {
        line: {
          stroke: '#3e3e42',
          strokeWidth: 1,
        },
        text: {
          fill: '#858585',
          fontSize: 11,
        },
      },
      legend: {
        text: {
          fill: '#858585',
          fontSize: 12,
        },
      },
    },
    grid: {
      line: {
        stroke: '#3e3e42',
        strokeWidth: 1,
        strokeDasharray: '3 3',
      },
    },
    tooltip: {
      container: {
        background: '#252526',
        border: '1px solid #3e3e42',
        borderRadius: '0',
        color: '#cccccc',
        fontSize: '12px',
        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      },
    },
    legends: {
      text: {
        fill: '#cccccc',
        fontSize: 11,
      },
    },
  };

  const colors = ['#007acc', '#569cd6', '#4ec9b0', '#dcdcaa'];

  return (
    <div className="bg-[#252526] border border-[#3e3e42]">
      <div className="bg-[#2d2d30] border-b border-[#3e3e42] px-2 sm:px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h3 className="text-xs sm:text-sm font-medium text-[#cccccc]">Token Comparison Chart</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setChartType('bar')}
            className={`flex-1 sm:flex-none px-3 py-2 sm:py-1 text-xs border transition-colors focus:outline-none focus:ring-2 focus:ring-[#007acc] flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0 ${
              chartType === 'bar'
                ? 'bg-[#007acc] text-white border-[#007acc]'
                : 'bg-[#3e3e42] text-[#858585] border-[#3e3e42] hover:text-[#cccccc]'
            }`}
            aria-label="Switch to bar chart"
            aria-pressed={chartType === 'bar'}
            title="Bar chart"
          >
            <BarChartIcon className="w-3.5 h-3.5" />
            <span>Bar</span>
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`flex-1 sm:flex-none px-3 py-2 sm:py-1 text-xs border transition-colors focus:outline-none focus:ring-2 focus:ring-[#007acc] flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0 ${
              chartType === 'pie'
                ? 'bg-[#007acc] text-white border-[#007acc]'
                : 'bg-[#3e3e42] text-[#858585] border-[#3e3e42] hover:text-[#cccccc]'
            }`}
            aria-label="Switch to pie chart"
            aria-pressed={chartType === 'pie'}
            title="Pie chart"
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            <span>Pie</span>
          </button>
        </div>
      </div>
      <div className="p-2 sm:p-4">
        {chartType === 'bar' ? (
          <div style={{ height: '300px' }} className="sm:h-[400px]">
            <ResponsiveBar
              data={barData}
              keys={showStructure ? ['structure', 'data', 'total'] : ['total']}
              indexBy="format"
              margin={{ top: 20, right: 10, bottom: 60, left: 50 }}
              padding={0.3}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={showStructure ? ['#569cd6', '#4ec9b0', '#007acc'] : ['#007acc']}
              theme={theme}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Format',
                legendPosition: 'middle',
                legendOffset: 50,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Tokens',
                legendPosition: 'middle',
                legendOffset: -60,
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor="#cccccc"
              legends={
                showStructure
                  ? [
                      {
                        dataFrom: 'keys',
                        anchor: 'top-right',
                        direction: 'column',
                        justify: false,
                        translateX: 20,
                        translateY: 0,
                        itemsSpacing: 2,
                        itemWidth: 100,
                        itemHeight: 20,
                        itemDirection: 'left-to-right',
                        itemOpacity: 1,
                        symbolSize: 12,
                        effects: [
                          {
                            on: 'hover',
                            style: {
                              itemOpacity: 1,
                            },
                          },
                        ],
                      },
                    ]
                  : []
              }
              tooltip={({ id, value, indexValue, data }) => {
                const formatData = data as (typeof barData)[0];
                return (
                  <div className="bg-[#252526] border border-[#3e3e42] p-2 text-xs">
                    <div className="text-[#cccccc] font-semibold mb-1">{indexValue}</div>
                    <div className="text-[#858585]">
                      {showStructure && id !== 'total' ? (
                        <>
                          {String(id)}: <span className="text-[#cccccc] font-mono">{value}</span>
                        </>
                      ) : (
                        <>
                          Total: <span className="text-[#cccccc] font-mono">{value}</span>
                          <br />
                          Difference:{' '}
                          <span
                            className={`font-mono ${
                              formatData.difference < 0 ? 'text-[#4ec9b0]' : 'text-[#f48771]'
                            }`}
                          >
                            {formatData.difference > 0 ? '+' : ''}
                            {formatData.difference} ({formatData.percentageDiff > 0 ? '+' : ''}
                            {formatData.percentageDiff}%)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              }}
              animate={true}
              motionConfig="gentle"
            />
          </div>
        ) : (
          <div style={{ height: '300px' }} className="sm:h-[400px]">
            <ResponsivePie
              data={pieData}
              margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
              innerRadius={0.5}
              padAngle={2}
              cornerRadius={4}
              activeOuterRadiusOffset={8}
              colors={colors}
              theme={theme}
              borderWidth={1}
              borderColor={{
                from: 'color',
                modifiers: [['darker', 0.2]],
              }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#858585"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{
                from: 'color',
                modifiers: [['darker', 2]],
              }}
              tooltip={({ datum }) => {
                const data = datum.data as (typeof pieData)[0];
                return (
                  <div className="bg-[#252526] border border-[#3e3e42] p-2 text-xs">
                    <div className="text-[#cccccc] font-semibold mb-1">{datum.label}</div>
                    <div className="text-[#858585] space-y-1">
                      <div>
                        Total: <span className="text-[#cccccc] font-mono">{datum.value}</span>
                      </div>
                      {showStructure && (
                        <>
                          <div>
                            Structure:{' '}
                            <span className="text-[#569cd6] font-mono">{data.structure}</span>
                          </div>
                          <div>
                            Data: <span className="text-[#4ec9b0] font-mono">{data.data}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              }}
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  translateX: 0,
                  translateY: 50,
                  itemsSpacing: 10,
                  itemWidth: 70,
                  itemHeight: 18,
                  itemTextColor: '#cccccc',
                  itemDirection: 'left-to-right',
                  itemOpacity: 1,
                  symbolSize: 12,
                  symbolShape: 'circle',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemTextColor: '#ffffff',
                        itemOpacity: 1,
                      },
                    },
                  ],
                },
              ]}
              animate={true}
              motionConfig="gentle"
            />
          </div>
        )}
      </div>
    </div>
  );
}
