import type { ToastNotice } from '../hooks/useTodoStore';
import { CloseIcon } from './Icons';

interface ToastProps {
  toast: ToastNotice | null;
  onUndo: () => void;
  onDismiss: () => void;
}

export function Toast({ toast, onUndo, onDismiss }: ToastProps) {
  if (!toast) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast-message">{toast.message}</span>
      <div className="toast-actions">
        {toast.canUndo && (
          <button type="button" className="toast-undo-btn" onClick={onUndo}>
            Undo
          </button>
        )}
        <button
          type="button"
          className="toast-close-btn"
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          <CloseIcon width={14} height={14} />
        </button>
      </div>
    </div>
  );
}
