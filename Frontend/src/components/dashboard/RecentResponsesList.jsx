import { Link } from 'react-router-dom';
import Card from '../common/Card.jsx';
import EmptyState from '../common/EmptyState.jsx';

export default function RecentResponsesList({ responses }) {
  return (
    <Card padded={false}>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-ink-900">Recent Regulatory Responses</h3>
        <Link to="/responses" className="text-xs font-medium text-brand-700 hover:underline">
          View all responses
        </Link>
      </div>
      {responses.length === 0 ? (
        <EmptyState title="No responses yet" description="Official responses to flags will appear here." />
      ) : (
        <ul className="divide-y divide-border">
          {responses.map((r) => (
            <li key={r.id}>
              <Link to={`/responses/${r.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-sunken">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium text-ink-900">
                    <span className="font-mono text-xs text-ink-500">{r.flagId}</span>
                    <span className="truncate">{r.responseType}</span>
                  </p>
                  <p className="truncate text-xs text-ink-500">{r.authority}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
