import { useEffect } from 'react';
import Button from './Button.jsx';

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', variant = 'primary', onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4">
      <div className="w-full max-w-sm rounded-md bg-surface-card p-5 shadow-popover">
        <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
        {description && <p className="mt-1.5 text-sm text-ink-500">{description}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={variant} size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
