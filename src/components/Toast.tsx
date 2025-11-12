import { useToast } from '@/contexts/ToastContext';
import type { Toast as ToastType } from '@/types';
import { UI_SIZES } from '@/constants';
import { CloseIcon } from './Icons';

function ToastItem({ toast }: { toast: ToastType }) {
  const { removeToast } = useToast();

  const bgColor = {
    success: 'bg-[#4ec9b0]',
    error: 'bg-[#f48771]',
    info: 'bg-[#569cd6]',
  }[toast.type];

  return (
    <div
      className={`${bgColor} text-[#1e1e1e] px-4 py-3 border border-[#3e3e42] mb-2 flex items-center justify-between animate-slide-in shadow-lg`}
      style={{
        minWidth: `${UI_SIZES.TOAST_MIN_WIDTH}px`,
        maxWidth: `${UI_SIZES.TOAST_MAX_WIDTH}px`,
      }}
      role="alert"
    >
      <span className="text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        className="ml-4 text-[#1e1e1e] hover:text-[#3e3e42] transition-colors p-0.5"
        aria-label="Close notification"
        title="Close"
      >
        <CloseIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
