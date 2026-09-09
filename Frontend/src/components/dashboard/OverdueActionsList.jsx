import { Link } from 'react-router-dom';
import Card from '../common/Card.jsx';
import EmptyState from '../common/EmptyState.jsx';

function formatDueDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export default function OverdueActionsList({ actions }) {
  return (
    <Card padded={false}>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-ink-900">Overdue Corrective Actions</h3>
        <Link to="/corrective-actions" className="text-xs font-medium text-brand-700 hover:underline">
          View all
        </Link>
      </div>
      {actions.length === 0 ? (
        <EmptyState title="Nothing overdue" description="Corrective actions past their deadline will appear here." />
      ) : (
        <ul className="divide-y divide-border">
          {actions.map((a) => (
            <li key={a.id}>
              <Link to={`/corrective-actions/${a.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-sunken">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium text-ink-900">
                    <span className="font-mono text-xs text-ink-500">{a.id}</span>
                    <span className="truncate">{a.issue}</span>
                  </p>
                  <p className="truncate text-xs text-ink-500">{a.mineName} · {a.assignedTo}</p>
                </div>
                <span className="shrink-0 text-xs font-medium text-status-danger">
                  Due {formatDueDate(a.dueDate)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
