import { useState, useRef, useMemo } from 'react';
import { useAppState } from '@/contexts/AppStateContext';
import { useTokenCount } from '@/hooks/useTokenCount';
import { useToast } from '@/contexts/ToastContext';
import { ButtonLoader } from './ButtonLoader';
import { INPUT_LIMITS, DEFAULT_INPUT_TEXT } from '@/constants';

interface InputFormProps {
  onInputChange?: (text: string) => void;
}

export function InputForm({ onInputChange }: InputFormProps = {}) {
  const { compareFormats, isLoading } = useAppState();
  const { showToast } = useToast();
  const [inputText, setInputText] = useState<string>(DEFAULT_INPUT_TEXT);
  const { tokenCount, isCalculating } = useTokenCount(inputText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Optimized: Calculate charCount directly instead of useEffect
  const charCount = useMemo(() => inputText.length, [inputText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();

    if (!trimmed) {
      showToast('Please enter a description of the data you want to compare.', 'error');
      textareaRef.current?.focus();
      return;
    }

    if (trimmed.length < INPUT_LIMITS.MIN_LENGTH) {
      showToast(
        `Please provide a data description (at least ${INPUT_LIMITS.MIN_LENGTH} characters).`,
        'error'
      );
      textareaRef.current?.focus();
      return;
    }

    if (trimmed.length > INPUT_LIMITS.MAX_LENGTH) {
      showToast(
        `Input is too long (max ${INPUT_LIMITS.MAX_LENGTH} characters). Please shorten your description.`,
        'error'
      );
      textareaRef.current?.focus();
      return;
    }

    compareFormats(trimmed);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= INPUT_LIMITS.MAX_LENGTH) {
      setInputText(value);
      onInputChange?.(value);
    } else {
      showToast(`Maximum length is ${INPUT_LIMITS.MAX_LENGTH} characters.`, 'info');
    }
  };

  const isNearLimit = useMemo(
    () => charCount > INPUT_LIMITS.MAX_LENGTH * INPUT_LIMITS.NEAR_LIMIT_THRESHOLD,
    [charCount]
  );
  const isTooShort = useMemo(
    () => charCount > 0 && charCount < INPUT_LIMITS.MIN_LENGTH,
    [charCount]
  );

  return (
    <div className="bg-[#252526] border border-[#3e3e42] transition-all">
      <div className="bg-[#2d2d30] border-b border-[#3e3e42] px-4 py-2 flex items-center justify-between">
        <label
          htmlFor="data-description"
          className="text-xs font-medium text-[#858585] uppercase tracking-wide"
        >
          Data Description
        </label>
        <div className="flex items-center gap-3">
          <div className={`text-xs font-mono ${isNearLimit ? 'text-[#f48771]' : 'text-[#858585]'}`}>
            {charCount}/{INPUT_LIMITS.MAX_LENGTH}
          </div>
          <div className="text-xs text-[#858585] font-mono">
            {isCalculating ? 'Calculating...' : `${tokenCount.toLocaleString()} tokens`}
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-4">
        <div className="relative">
          <textarea
            ref={textareaRef}
            id="data-description"
            value={inputText}
            onChange={handleInputChange}
            className={`w-full h-32 sm:h-40 p-3 bg-[#1e1e1e] border text-[#cccccc] font-mono text-xs sm:text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#007acc] transition-all ${
              isNearLimit
                ? 'border-[#f48771]'
                : isTooShort
                  ? 'border-[#dcdcaa]'
                  : 'border-[#3e3e42]'
            }`}
            placeholder="Describe any data structure: simple or complex, structured or unstructured, with examples or abstract descriptions. Examples: 'user profile with name and email', 'API response with status code and data array', 'log entries with timestamp and message', 'nested configuration object', etc."
            disabled={isLoading}
            style={{ fontFamily: 'Consolas, Monaco, "Courier New", monospace' }}
            aria-describedby="input-help input-errors"
            aria-invalid={isTooShort || isNearLimit}
            maxLength={INPUT_LIMITS.MAX_LENGTH}
          />
          {isTooShort && (
            <div
              id="input-errors"
              className="absolute bottom-2 left-3 text-xs text-[#dcdcaa] flex items-center gap-1"
              role="alert"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              At least {INPUT_LIMITS.MIN_LENGTH} characters required
            </div>
          )}
        </div>
        <div id="input-help" className="text-xs text-[#858585] mt-2 flex items-center gap-1">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Describe any data structure - simple or complex, structured or unstructured. The AI will interpret and convert it to all formats.
        </div>
        <div className="mt-4 flex justify-center">
          <button
            type="submit"
            disabled={
              charCount < INPUT_LIMITS.MIN_LENGTH ||
              charCount > INPUT_LIMITS.MAX_LENGTH ||
              isLoading
            }
            className={`w-full sm:w-auto text-sm font-medium py-3 sm:py-2 px-4 border transition-all flex items-center justify-center gap-2 min-h-[44px] sm:min-h-0 ${
              charCount >= INPUT_LIMITS.MIN_LENGTH &&
              charCount <= INPUT_LIMITS.MAX_LENGTH &&
              !isLoading
                ? 'bg-[#0e639c] hover:bg-[#1177bb] text-white border-[#007acc] cursor-pointer'
                : 'bg-[#3e3e42] text-[#858585] border-[#3e3e42] cursor-not-allowed'
            }`}
            aria-label={
              charCount >= INPUT_LIMITS.MIN_LENGTH &&
              charCount <= INPUT_LIMITS.MAX_LENGTH &&
              !isLoading
                ? 'Compare formats'
                : 'Please enter a valid description to compare formats'
            }
          >
            {isLoading ? (
              <>
                <ButtonLoader />
                <span>Analyzing...</span>
              </>
            ) : (
              <span>Compare Formats</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
