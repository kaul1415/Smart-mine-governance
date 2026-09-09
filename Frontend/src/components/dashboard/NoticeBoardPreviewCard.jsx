import { Link } from 'react-router-dom';
import { Megaphone } from 'lucide-react';
import Card from '../common/Card.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { formatDate } from '../../utils/format.js';

const PRIORITY_TONE = {
  HIGH: 'bg-status-dangerBg text-status-danger',
  MEDIUM: 'bg-status-warningBg text-status-warning',
  LOW: 'bg-status-neutralBg text-status-neutral',
};

export default function NoticeBoardPreviewCard({ notices }) {
  const active = notices.filter((n) => n.status === 'Active').slice(0, 4);

  return (
    <Card padded={false}>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
          <Megaphone size={15} /> Common Notice Board
        </h3>
        <Link to="/notices" className="text-xs font-medium text-brand-700 hover:underline">
          View all notices
        </Link>
      </div>
      {active.length === 0 ? (
        <EmptyState title="No active notices" description="Organization-wide announcements will appear here." />
      ) : (
        <ul className="divide-y divide-border">
          {active.map((n) => (
            <li key={n.id} className="px-5 py-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-ink-900">{n.title}</span>
                <span className={`shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] font-medium ${PRIORITY_TONE[n.priority]}`}>{n.priority}</span>
              </div>
              <p className="text-xs text-ink-500">
                {n.category} · Published {formatDate(n.publishedDate)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
