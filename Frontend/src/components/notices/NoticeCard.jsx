import { Megaphone } from 'lucide-react';
import { formatDate } from '../../utils/format.js';

const PRIORITY_TONE = {
  HIGH: 'bg-status-dangerBg text-status-danger',
  MEDIUM: 'bg-status-warningBg text-status-warning',
  LOW: 'bg-status-neutralBg text-status-neutral',
};

const CATEGORY_TONE = 'bg-brand-100 text-brand-800';

export default function NoticeCard({ notice }) {
  const expired = notice.status === 'Expired';
  return (
    <div className={`rounded-md border border-border bg-surface-card p-4 ${expired ? 'opacity-60' : ''}`}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className={`rounded-sm px-2 py-0.5 text-xs font-medium ${CATEGORY_TONE}`}>{notice.category}</span>
        <span className={`rounded-sm px-2 py-0.5 text-xs font-medium ${PRIORITY_TONE[notice.priority]}`}>{notice.priority}</span>
        {expired && <span className="rounded-sm bg-status-neutralBg px-2 py-0.5 text-xs font-medium text-status-neutral">Expired</span>}
      </div>
      <p className="flex items-start gap-1.5 text-sm font-semibold text-ink-900">
        <Megaphone size={14} className="mt-0.5 shrink-0 text-brand-700" />
        {notice.title}
      </p>
      <p className="mt-1.5 text-sm text-ink-700">{notice.description}</p>
      <p className="mt-2 text-xs text-ink-500">
        Published {formatDate(notice.publishedDate)} · Expires {formatDate(notice.expiryDate)}
      </p>
    </div>
  );
}
