import { lazy, Suspense, useEffect, useState, useMemo, useOptimistic, useTransition } from 'react';
import { AppStateProvider, useAppState } from '@/contexts/AppStateContext';
import { ToastProvider, useToast } from '@/contexts/ToastContext';
import { HistoryProvider, useHistory } from '@/contexts/HistoryContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { InputForm } from '@/components/InputForm';
import { Loader } from '@/components/Loader';
import { ToastContainer } from '@/components/Toast';
import { ExportButtons } from '@/components/ExportButtons';
import { ComparisonChart } from '@/components/ComparisonChart';
import { SummaryTable } from '@/components/SummaryTable';
import { CostCalculator } from '@/components/CostCalculator';
import { AdvancedAnalysis } from '@/components/AdvancedAnalysis';
import { ScoreWidgets } from '@/components/ScoreWidgets';
import { SmartRecommendations } from '@/components/SmartRecommendations';
import { BuyMeCoffee } from '@/components/BuyMeCoffee';
import {
  CrownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HistoryIcon,
  CloseIcon,
  SearchIcon,
  DeleteIcon,
} from '@/components/Icons';
import { EmptyState } from '@/components/EmptyState';
import type { FormatName, ComparisonResult, SortOption, FilterOption, CostEstimate } from '@/types';
import { UI_SIZES } from '@/constants';
import { API_PRICING } from '@/constants/costs';
import { calculateCost } from '@/utils/costCalculator';

const ResultCard = lazy(() =>
  import('@/components/ResultCard').then(module => ({ default: module.ResultCard }))
);

function ResultCardSkeleton() {
  return (
    <div
      className="flex flex-col bg-[#252526] border border-[#3e3e42] overflow-hidden animate-pulse"
      style={{ height: `${UI_SIZES.RESULT_CARD_HEIGHT}px` }}
    >
      <div className="p-3 bg-[#2d2d30] border-b border-[#3e3e42] h-10 flex-shrink-0" />
      <div className="flex-1 p-4 bg-[#1e1e1e]">
        <div className="h-32 bg-[#2d2d30] rounded" />
      </div>
      <div className="px-4 py-3 border-t border-[#3e3e42] bg-[#252526] flex-shrink-0">
        <div className="h-16 bg-[#2d2d30] rounded" />
      </div>
    </div>
  );
}

type ViewMode = 'cards' | 'table' | 'chart' | 'analysis' | 'cost';

function AppContent() {
  const { comparisonResult, isLoading, error, compareFormats } = useAppState();
  const { showToast } = useToast();
  const { saveToHistory, history, removeFromHistory } = useHistory();
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [sortBy, setSortBy] = useState<SortOption>('tokens');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [inputText, setInputText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [, startTransition] = useTransition();

  // Optimistic UI for history deletion - instant feedback
  const [optimisticHistory, setOptimisticHistory] = useOptimistic(
    history,
    (currentHistory: typeof history, deletedId: string) => {
      return currentHistory.filter((item: (typeof history)[0]) => item.id !== deletedId);
    }
  );

  useKeyboardShortcuts([
    { key: 'k', ctrl: true, action: () => startTransition(() => setViewMode('cards')) },
    { key: 't', ctrl: true, action: () => startTransition(() => setViewMode('table')) },
    { key: 'c', ctrl: true, action: () => startTransition(() => setViewMode('chart')) },
    { key: 'a', ctrl: true, action: () => startTransition(() => setViewMode('analysis')) },
    { key: 'd', ctrl: true, action: () => startTransition(() => setViewMode('cost')) },
    { key: 'b', ctrl: true, action: () => setSidebarOpen(prev => !prev) },
    {
      key: 'h',
      ctrl: true,
      action: () =>
        showToast(
          'Ctrl+K: Cards | Ctrl+T: Table | Ctrl+C: Chart | Ctrl+A: Analysis | Ctrl+D: Cost | Ctrl+B: Toggle Sidebar',
          'info'
        ),
    },
  ]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  useEffect(() => {
    if (comparisonResult && inputText.trim()) {
      const saved = saveToHistory(inputText.trim(), comparisonResult);
      if (saved) {
        // History is automatically reloaded by the context
      } else {
        showToast('Failed to save to history. Storage may be full.', 'error');
      }
    }
  }, [comparisonResult, inputText, saveToHistory, showToast]);

  const formatOrder: FormatName[] = ['JSON', 'CSV', 'TOON', 'YAML'];

  // Optimized: Pre-compute baseline and format data map for O(1) lookups
  const baselineTokens = comparisonResult?.json.token_breakdown.total ?? 0;
  const formatDataMap = useMemo(() => {
    if (!comparisonResult) return new Map<FormatName, ComparisonResult[keyof ComparisonResult]>();
    return new Map<FormatName, ComparisonResult[keyof ComparisonResult]>(
      formatOrder.map((format: FormatName) => [
        format,
        comparisonResult[format.toLowerCase() as keyof ComparisonResult],
      ])
    );
  }, [comparisonResult]);

  // Optimized: Filter and sort in single pass with memoized comparisons
  const filteredAndSortedFormats = useMemo(() => {
    // Filter first (cheap operation)
    const filtered =
      filterBy === 'all' ? formatOrder : formatOrder.filter(format => format === filterBy);

    if (!comparisonResult) return filtered;

    // Sort with pre-computed values
    return [...filtered].sort((a, b) => {
      const aData = formatDataMap.get(a);
      const bData = formatDataMap.get(b);
      if (!aData || !bData) return 0;

      switch (sortBy) {
        case 'tokens':
          return aData.token_breakdown.total - bData.token_breakdown.total;
        case 'savings': {
          const aSavings = baselineTokens - aData.token_breakdown.total;
          const bSavings = baselineTokens - bData.token_breakdown.total;
          return bSavings - aSavings;
        }
        case 'name':
          return a.localeCompare(b);
        default:
          return 0;
      }
    });
  }, [comparisonResult, filterBy, sortBy, baselineTokens, formatDataMap]);

  const tabs = [
    { id: 'cards', label: 'Cards' },
    { id: 'table', label: 'Table' },
    { id: 'chart', label: 'Chart' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'cost', label: 'Cost' },
  ] as const;

  return (
    <div
      className="h-screen bg-[#1e1e1e] text-[#cccccc] flex flex-col overflow-hidden"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* Title Bar */}
      <div className="bg-[#2d2d30] border-b border-[#3e3e42] px-2 sm:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <CrownIcon className="w-4 h-4 text-[#858585] flex-shrink-0" />
          <h1 className="text-xs sm:text-sm font-medium text-[#cccccc] truncate">
            <span className="hidden sm:inline">Monarch Labs Token Optimizer</span>
            <span className="sm:hidden">Token Optimizer</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="px-2 sm:px-3 py-1 text-xs text-[#cccccc] hover:bg-[#2a2d2e] border border-[#3e3e42] flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#007acc] min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
            title="Toggle Sidebar (Ctrl+B)"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? (
              <ChevronLeftIcon className="w-3 h-3" />
            ) : (
              <ChevronRightIcon className="w-3 h-3" />
            )}
            <HistoryIcon className="w-3.5 h-3.5" />
            {optimisticHistory.length > 0 && (
              <span className="px-1.5 py-0.5 bg-[#007acc] text-white text-[10px] rounded">
                {optimisticHistory.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        {sidebarOpen && (
          <>
            {/* Mobile overlay backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            {/* Sidebar */}
            <div
              className="bg-[#252526] border-r border-[#3e3e42] flex flex-col transition-all duration-200 ease-in-out fixed md:relative inset-y-0 left-0 z-50 md:z-auto"
              style={{ width: `${UI_SIZES.SIDEBAR_WIDTH}px` }}
            >
            <div className="p-3 border-b border-[#3e3e42] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <HistoryIcon className="w-3.5 h-3.5 text-[#858585]" />
                <h2 className="text-xs font-semibold text-[#858585] uppercase tracking-wide">
                  History
                </h2>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-[#858585] hover:text-[#cccccc] transition-colors focus:outline-none focus:ring-2 focus:ring-[#007acc] rounded p-1"
                title="Close sidebar"
                aria-label="Close sidebar"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 border-b border-[#3e3e42]">
              <div className="relative">
                <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[#858585]" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={historySearchQuery}
                  onChange={e => setHistorySearchQuery(e.target.value)}
                  className="w-full bg-[#3e3e42] text-[#cccccc] text-xs pl-7 pr-2 py-1.5 border border-[#3e3e42] focus:outline-none focus:ring-2 focus:ring-[#007acc] transition-colors"
                  aria-label="Search history"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {(() => {
                const filteredHistory = historySearchQuery
                  ? optimisticHistory.filter(
                      (item: (typeof optimisticHistory)[0]) =>
                        item.inputText.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
                        item.tags?.some((tag: string) =>
                          tag.toLowerCase().includes(historySearchQuery.toLowerCase())
                        )
                    )
                  : optimisticHistory;

                if (filteredHistory.length === 0) {
                  return (
                    <div className="p-4 text-xs text-[#858585] text-center">No history found</div>
                  );
                }

                return (
                  <div className="divide-y divide-[#3e3e42]">
                    {filteredHistory
                      .slice(0, UI_SIZES.HISTORY_ITEM_LIMIT)
                      .map((item: (typeof filteredHistory)[0]) => (
                        <div
                          key={item.id}
                          className="p-3 hover:bg-[#2a2d2e] cursor-pointer group"
                          onClick={() => {
                            startTransition(() => {
                              compareFormats(item.inputText);
                              setInputText(item.inputText);
                              showToast('Loaded from history', 'success');
                            });
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              startTransition(() => {
                                compareFormats(item.inputText);
                                setInputText(item.inputText);
                                showToast('Loaded from history', 'success');
                              });
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`Load comparison: ${item.inputText.substring(0, 50)}...`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="text-xs text-[#cccccc] line-clamp-2 flex-1">
                              {item.inputText}
                            </div>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                // Optimistic update - UI updates immediately
                                setOptimisticHistory(item.id);
                                // Actual deletion happens in background
                                startTransition(() => {
                                  const deleted = removeFromHistory(item.id);
                                  if (!deleted) {
                                    // Revert optimistic update on failure
                                    showToast('Failed to delete from history', 'error');
                                  }
                                });
                              }}
                              className="text-[#f48771] hover:text-[#ff9d85] ml-2 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#007acc] rounded p-1"
                              title="Delete"
                              aria-label="Delete from history"
                            >
                              <DeleteIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-xs text-[#858585]">
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="text-xs bg-[#0e639c] text-[#cccccc] px-2 py-0.5"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                );
              })()}
            </div>
          </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Tab Bar */}
          <div className="bg-[#2d2d30] border-b border-[#3e3e42] flex items-center gap-1 px-1 sm:px-2 overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id as ViewMode)}
                  className={`px-3 sm:px-4 py-2 text-xs font-medium border border-b-0 border-[#3e3e42] transition-colors focus:outline-none focus:ring-2 focus:ring-[#007acc] whitespace-nowrap min-h-[44px] ${
                    viewMode === tab.id
                      ? 'bg-[#1e1e1e] text-[#cccccc] border-t-2 border-t-[#007acc]'
                      : 'bg-[#2d2d30] text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2d2e]'
                  }`}
                  aria-label={`Switch to ${tab.label} view`}
                  aria-pressed={viewMode === tab.id}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 flex-shrink-0">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="bg-[#3e3e42] text-[#cccccc] text-xs px-2 py-1.5 border border-[#3e3e42] focus:outline-none focus:ring-2 focus:ring-[#007acc] transition-colors min-h-[44px] sm:min-h-0"
                aria-label="Sort formats by"
              >
                <option value="tokens">Sort: Tokens</option>
                <option value="savings">Sort: Savings</option>
                <option value="name">Sort: Name</option>
              </select>
              <select
                value={filterBy}
                onChange={e => setFilterBy(e.target.value as FilterOption)}
                className="bg-[#3e3e42] text-[#cccccc] text-xs px-2 py-1.5 border border-[#3e3e42] focus:outline-none focus:ring-2 focus:ring-[#007acc] transition-colors min-h-[44px] sm:min-h-0"
                aria-label="Filter formats"
              >
                <option value="all">All Formats</option>
                {formatOrder.map(format => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 overflow-y-auto bg-[#1e1e1e]">
            <div
              className="max-w-full mx-auto p-3 sm:p-4 md:p-6 pb-8"
              style={{ maxWidth: `${UI_SIZES.MAX_CONTENT_WIDTH}px` }}
            >
              {/* Input Section */}
              <div className="mb-6">
                <InputForm onInputChange={setInputText} />
              </div>

              {isLoading && <Loader />}

              {!isLoading && !comparisonResult && !error && (
                <div className="mt-12">
                  <EmptyState
                    title="Ready to Compare Formats"
                    description="Enter a data description above to see how different formats (JSON, CSV, TOON, YAML) compare in terms of token usage. This helps optimize your API costs by choosing the most efficient format."
                    icon={
                      <svg
                        className="w-16 h-16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    }
                  />
                </div>
              )}

              {error && !isLoading && (
                <div className="mt-6 bg-[#252526] border border-[#f48771] p-4 rounded">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-[#f48771] flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-[#cccccc] mb-1">Error</h3>
                      <p className="text-sm text-[#858585] mb-3">{error}</p>
                      <button
                        onClick={() => {
                          const textarea = document.getElementById(
                            'data-description'
                          ) as HTMLTextAreaElement;
                          if (textarea?.value.trim()) {
                            compareFormats(textarea.value.trim());
                          }
                        }}
                        className="text-xs text-[#007acc] hover:text-[#1177bb] underline"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {comparisonResult && (
                <>
                  <div className="mb-6">
                    <SmartRecommendations result={comparisonResult} inputText={inputText} />
                  </div>

                  <div className="mb-6">
                    <ScoreWidgets result={comparisonResult} />
                  </div>

                  <div className="mb-4">
                    <ExportButtons result={comparisonResult} inputText={inputText} />
                  </div>

                  {viewMode === 'cards' && (
                    <div className="space-y-4">
                      {/* CSV Card - Full Width on Top */}
                      {(() => {
                        const csvData = comparisonResult.csv;
                        if (!csvData) return null;

                        const costEstimates: Record<string, CostEstimate> = {};
                        Object.keys(API_PRICING).forEach(key => {
                          const pricing = API_PRICING[key];
                          if (pricing) {
                            costEstimates[key] = calculateCost(
                              csvData.token_breakdown.total,
                              pricing,
                              true
                            );
                          }
                        });

                        return (
                          <Suspense fallback={<ResultCardSkeleton />}>
                            <ResultCard
                              formatName="CSV"
                              code={csvData.code}
                              tokenBreakdown={csvData.token_breakdown}
                              baselineTokenCount={comparisonResult.json.token_breakdown.total}
                              costEstimates={costEstimates}
                            />
                          </Suspense>
                        );
                      })()}

                      {/* Other Format Cards - Responsive grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAndSortedFormats
                          .filter((formatName: FormatName) => formatName !== 'CSV')
                          .map((formatName: FormatName) => {
                            const data =
                              comparisonResult[formatName.toLowerCase() as keyof ComparisonResult];
                            if (!data) return null;

                            // Calculate costs for all models
                            const costEstimates: Record<string, CostEstimate> = {};
                            Object.keys(API_PRICING).forEach(key => {
                              const pricing = API_PRICING[key];
                              if (pricing) {
                                costEstimates[key] = calculateCost(
                                  data.token_breakdown.total,
                                  pricing,
                                  true
                                );
                              }
                            });

                            return (
                              <Suspense key={formatName} fallback={<ResultCardSkeleton />}>
                                <ResultCard
                                  formatName={formatName}
                                  code={data.code}
                                  tokenBreakdown={data.token_breakdown}
                                  baselineTokenCount={comparisonResult.json.token_breakdown.total}
                                  costEstimates={costEstimates}
                                />
                              </Suspense>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {viewMode === 'table' && (
                    <div>
                      <SummaryTable result={comparisonResult} showCost={false} />
                    </div>
                  )}

                  {viewMode === 'chart' && (
                    <div>
                      <ComparisonChart result={comparisonResult} showStructure={true} />
                    </div>
                  )}

                  {viewMode === 'analysis' && (
                    <div>
                      <AdvancedAnalysis result={comparisonResult} />
                    </div>
                  )}

                  {viewMode === 'cost' && (
                    <div>
                      <CostCalculator result={comparisonResult} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Status Bar */}
          <div className="bg-[#007acc] text-white text-xs px-4 py-1 flex items-center gap-4 border-t border-[#005a9e]">
            <span>
              {comparisonResult
                ? `${filteredAndSortedFormats.length} format${filteredAndSortedFormats.length !== 1 ? 's' : ''} compared`
                : 'Ready'}
            </span>
            {comparisonResult && (
              <span>Baseline: {comparisonResult.json.token_breakdown.total} tokens</span>
            )}
            <div className="flex-1" />
            <BuyMeCoffee />
            <span className="hidden sm:inline">Powered by Google Gemini • tiktoken (cl100k_base)</span>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <HistoryProvider>
        <AppStateProvider>
          <AppContent />
        </AppStateProvider>
      </HistoryProvider>
    </ToastProvider>
  );
}
