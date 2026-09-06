import { Link } from 'react-router-dom';
import Card from '../common/Card.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import EmptyState from '../common/EmptyState.jsx';

const SEVERITY_DOT = {
  LOW: 'bg-risk-low',
  MEDIUM: 'bg-risk-medium',
  HIGH: 'bg-risk-high',
  CRITICAL: 'bg-risk-critical',
};

export default function RecentFlagsList({ flags }) {
  return (
    <Card padded={false}>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-ink-900">Recent Flags</h3>
        <Link to="/flags" className="text-xs font-medium text-brand-700 hover:underline">
          View all flags
        </Link>
      </div>
      {flags.length === 0 ? (
        <EmptyState title="No flags found" description="Field reports and complaints will appear here." />
      ) : (
        <ul className="divide-y divide-border">
          {flags.map((flag) => (
            <li key={flag.id}>
              <Link to={`/flags/${flag.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-sunken">
                <span className={`h-2 w-2 shrink-0 rounded-full ${SEVERITY_DOT[flag.severity]}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium text-ink-900">
                    <span className="font-mono text-xs text-ink-500">{flag.id}</span>
                    <span className="truncate">{flag.category} · {flag.mineName}</span>
                  </p>
                  <p className="truncate text-xs text-ink-500">{flag.description}</p>
                </div>
                <StatusBadge status={flag.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
