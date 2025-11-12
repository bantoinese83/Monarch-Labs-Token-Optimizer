import { useState } from 'react';
import type { ComparisonResult } from '@/types';
import {
  exportToCSV,
  exportToJSON,
  exportToMarkdown,
  copyToClipboard,
  generateShareableLink,
} from '@/utils/export';
import { useToast } from '@/contexts/ToastContext';
import { ShareIcon, FileCSVIcon, FileJSONIcon, FileMarkdownIcon, CopyIcon } from './Icons';

interface ExportButtonsProps {
  result: ComparisonResult;
  inputText: string;
}

export function ExportButtons({ result, inputText }: ExportButtonsProps) {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'json' | 'markdown') => {
    setIsExporting(true);
    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (format) {
        case 'csv':
          content = exportToCSV(result, inputText);
          filename = 'token-comparison.csv';
          mimeType = 'text/csv';
          break;
        case 'json':
          content = exportToJSON(result, inputText);
          filename = 'token-comparison.json';
          mimeType = 'application/json';
          break;
        case 'markdown':
          content = exportToMarkdown(result, inputText);
          filename = 'token-comparison.md';
          mimeType = 'text/markdown';
          break;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`Exported to ${format.toUpperCase()}`, 'success');
    } catch (error) {
      showToast('Failed to export', 'error');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    try {
      const link = generateShareableLink(result, inputText);
      copyToClipboard(link);
      showToast('Shareable link copied to clipboard', 'success');
    } catch {
      showToast('Failed to generate shareable link', 'error');
    }
  };

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
      <button
        onClick={() => handleExport('csv')}
        disabled={isExporting}
        className="px-3 py-2 sm:py-1.5 bg-[#0e639c] hover:bg-[#1177bb] disabled:bg-[#3e3e42] disabled:text-[#858585] text-white text-xs font-medium border border-[#007acc] transition-colors flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0"
        title="Export CSV"
        aria-label="Export CSV"
      >
        <FileCSVIcon className="w-3.5 h-3.5" />
        <span>CSV</span>
      </button>
      <button
        onClick={() => handleExport('json')}
        disabled={isExporting}
        className="px-3 py-2 sm:py-1.5 bg-[#0e639c] hover:bg-[#1177bb] disabled:bg-[#3e3e42] disabled:text-[#858585] text-white text-xs font-medium border border-[#007acc] transition-colors flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0"
        title="Export JSON"
        aria-label="Export JSON"
      >
        <FileJSONIcon className="w-3.5 h-3.5" />
        <span>JSON</span>
      </button>
      <button
        onClick={() => handleExport('markdown')}
        disabled={isExporting}
        className="px-3 py-2 sm:py-1.5 bg-[#0e639c] hover:bg-[#1177bb] disabled:bg-[#3e3e42] disabled:text-[#858585] text-white text-xs font-medium border border-[#007acc] transition-colors flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0"
        title="Export Markdown"
        aria-label="Export Markdown"
      >
        <FileMarkdownIcon className="w-3.5 h-3.5" />
        <span>MD</span>
      </button>
      <button
        onClick={handleShare}
        className="px-3 py-2 sm:py-1.5 bg-[#0e639c] hover:bg-[#1177bb] text-white text-xs font-medium border border-[#007acc] transition-colors flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0"
        title="Share link"
        aria-label="Share link"
      >
        <ShareIcon className="w-3.5 h-3.5" />
        <span>Share</span>
      </button>
    </div>
  );
}

export function CopyCodeButton({ code }: { code: string }) {
  const { showToast } = useToast();

  const handleCopy = async () => {
    try {
      await copyToClipboard(code);
      showToast('Code copied to clipboard', 'success');
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="px-2 py-1 bg-[#3e3e42] hover:bg-[#464647] text-[#cccccc] border border-[#3e3e42] transition-colors flex items-center justify-center"
      title="Copy code"
      aria-label="Copy code"
    >
      <CopyIcon className="w-3.5 h-3.5" />
    </button>
  );
}
