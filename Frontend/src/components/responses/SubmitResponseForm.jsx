import { useState } from 'react';
import { Send } from 'lucide-react';
import Button from '../common/Button.jsx';

const RESPONSE_TYPES = ['Issue Approved', 'Action Initiated', 'Action Taken', 'Resolved', 'Dismissed'];

const inputClass =
  'w-full rounded border border-border-strong px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-brand-600';

export default function SubmitResponseForm({ authorName, onSubmit }) {
  const [responseType, setResponseType] = useState(RESPONSE_TYPES[0]);
  const [officialResponse, setOfficialResponse] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!officialResponse.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ responseType, officialResponse, reason, authority: authorName });
      setOfficialResponse('');
      setReason('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded border border-border bg-surface-sunken p-3.5">
      <p className="text-sm font-medium text-ink-900">Submit Official Response</p>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-500">Response Type</label>
        <select value={responseType} onChange={(e) => setResponseType(e.target.value)} className={inputClass}>
          {RESPONSE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-500">Official Response</label>
        <textarea
          value={officialResponse}
          onChange={(e) => setOfficialResponse(e.target.value)}
          rows={3}
          placeholder="Describe the action being taken…"
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-500">Reason (optional)</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why this response, in brief"
          className={inputClass}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="sm" icon={Send} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit Response'}
        </Button>
      </div>
    </form>
  );
}
