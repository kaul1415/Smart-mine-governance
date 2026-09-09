import { useRef } from 'react';
import { UploadCloud, X, Paperclip } from 'lucide-react';

export default function FileUploader({ files, onChange, accept = 'image/*,.pdf', multiple = true, label = 'Evidence / Photo' }) {
  const inputRef = useRef(null);

  function handleSelect(e) {
    const selected = Array.from(e.target.files || []);
    onChange(multiple ? [...files, ...selected] : selected.slice(0, 1));
    e.target.value = '';
  }

  function removeAt(index) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink-700">{label}</label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-1.5 rounded border border-dashed border-border-strong bg-surface-sunken px-4 py-6 text-ink-500 hover:border-brand-600 hover:text-brand-700"
      >
        <UploadCloud size={22} />
        <span className="text-sm font-medium">Tap to attach photo or document</span>
        <span className="text-xs">JPG, PNG or PDF</span>
      </button>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={handleSelect} className="hidden" />

      {files.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between gap-2 rounded border border-border bg-surface-card px-3 py-1.5 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2 truncate text-ink-700">
                <Paperclip size={14} className="shrink-0 text-ink-500" />
                <span className="truncate">{file.name}</span>
              </span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove ${file.name}`}
                className="shrink-0 text-ink-500 hover:text-status-danger"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
