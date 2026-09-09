import { useRef } from 'react';
import { UploadCloud, FileText, X, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

const STATUS_META = {
  idle: null,
  uploading: { icon: Loader2, className: 'animate-spin text-status-info', label: 'Uploading…' },
  processing: { icon: Loader2, className: 'animate-spin text-status-warning', label: 'Processing…' },
  success: { icon: CheckCircle2, className: 'text-status-success', label: 'Text extracted' },
  error: { icon: AlertTriangle, className: 'text-status-danger', label: 'Upload failed' },
};

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Purely presentational — the parent page owns the actual
 * upload/OCR calls and passes the resulting `status` down. This
 * component never talks to a service or pretends to run OCR itself.
 */
export default function DocumentUploader({
  file,
  onSelect,
  onRemove,
  status = 'idle',
  errorMessage,
  accept = '.pdf,.jpg,.jpeg,.png',
  label = 'Upload Report Document',
  helpText = 'Supported: PDF, JPG, JPEG, PNG',
}) {
  const inputRef = useRef(null);
  const meta = STATUS_META[status];

  function handleChange(e) {
    const selected = e.target.files?.[0];
    if (selected) onSelect(selected);
    e.target.value = '';
  }

  if (!file) {
    return (
      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">{label}</label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-1.5 rounded border border-dashed border-border-strong bg-surface-sunken px-4 py-8 text-ink-500 hover:border-brand-600 hover:text-brand-700"
        >
          <UploadCloud size={24} />
          <span className="text-sm font-medium">Tap to select or drop a file</span>
          <span className="text-xs">{helpText}</span>
        </button>
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
      </div>
    );
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink-700">{label}</label>
      <div className="rounded border border-border bg-surface-card p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2">
            <FileText size={16} className="shrink-0 text-ink-500" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-ink-900">{file.name}</span>
              <span className="block text-xs text-ink-500">{formatSize(file.size)}</span>
            </span>
          </span>
          {status !== 'uploading' && status !== 'processing' && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${file.name}`}
              className="shrink-0 rounded p-1 text-ink-500 hover:text-status-danger"
            >
              <X size={15} />
            </button>
          )}
        </div>
        {meta && (
          <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${meta.className}`}>
            <meta.icon size={13} />
            {status === 'error' && errorMessage ? errorMessage : meta.label}
          </div>
        )}
      </div>
    </div>
  );
}
