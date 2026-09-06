import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ message = 'Unable to load this data.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <AlertTriangle size={26} className="text-status-danger" />
      <p className="text-sm font-medium text-ink-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded-sm border border-border-strong px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-surface-sunken"
        >
          Retry
        </button>
      )}
    </div>
  );
}
