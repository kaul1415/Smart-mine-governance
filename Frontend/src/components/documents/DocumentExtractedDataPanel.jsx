import { Bot } from 'lucide-react';
import { formatDate } from '../../utils/format.js';

export default function DocumentExtractedDataPanel({ data }) {
  if (!data) return null;
  return (
    <div className="rounded border border-brand-100 bg-brand-100/40 p-3.5">
      <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-800">
        <Bot size={13} /> AI Analysis — Extracted Data
      </p>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-ink-500">Document Type</dt>
          <dd className="font-medium text-ink-900">{data.documentType}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-500">Mine</dt>
          <dd className="text-ink-900">{data.mine}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-500">Inspection Date</dt>
          <dd className="text-ink-900">{formatDate(data.inspectionDate)}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-500">Inspector</dt>
          <dd className="text-ink-900">{data.inspector}</dd>
        </div>
      </dl>

      <div className="mt-3">
        <dt className="text-xs text-ink-500">Observations</dt>
        {data.observations?.length > 0 ? (
          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-ink-900">
            {data.observations.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-ink-500">None recorded.</p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-ink-500">High Severity Findings</span>
        <span className={`font-mono font-semibold ${data.highSeverityFindings > 0 ? 'text-status-danger' : 'text-status-success'}`}>
          {data.highSeverityFindings}
        </span>
      </div>
    </div>
  );
}
