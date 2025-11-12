import { useState } from 'react';
import { CloseIcon } from './Icons';

export function BuyMeCoffee() {
  const [showQR, setShowQR] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowQR(true)}
        className="px-2 py-1 text-xs text-white hover:bg-[#005a9e] transition-colors flex items-center gap-1.5 border border-[#005a9e] rounded"
        title="Buy Me a Coffee - Support the project"
        aria-label="Support the project - Buy Me a Coffee"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
        </svg>
        <span className="hidden sm:inline">Support</span>
      </button>

      {showQR && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowQR(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Buy Me a Coffee QR Code"
        >
          <div
            className="bg-[#252526] border-2 border-[#007acc] rounded-lg p-6 max-w-sm w-full relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#cccccc]">Buy Me a Coffee</h3>
              <button
                onClick={() => setShowQR(false)}
                className="text-[#858585] hover:text-[#cccccc] transition-colors"
                aria-label="Close"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-4">
              <img
                src="/qr-code.png"
                alt="Buy Me a Coffee QR Code"
                className="w-64 h-64 border-2 border-[#3e3e42] rounded"
              />
              <p className="text-sm text-[#858585] text-center">
                Scan the QR code to support the project
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

