import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';
import { formatDateTime } from '../../utils/format.js';

export default function ResponseCard({ response }) {
  return (
    <Link
      to={`/responses/${response.id}`}
      className="block rounded border border-border p-3.5 hover:bg-surface-sunken"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-ink-900">{response.responseType}</p>
        <StatusBadge status={response.status} />
      </div>
      <p className="text-sm text-ink-700">{response.officialResponse}</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-500">
        <span>{response.authority}</span>
        <span>{formatDateTime(response.date)}</span>
      </div>
      {response.supportingDocuments?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {response.supportingDocuments.map((doc) => (
            <span key={doc} className="inline-flex items-center gap-1 rounded-sm bg-surface-sunken px-2 py-0.5 text-xs text-ink-700">
              <FileText size={11} /> {doc}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
