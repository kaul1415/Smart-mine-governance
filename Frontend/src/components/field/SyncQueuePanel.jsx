import { Clock, RefreshCw } from 'lucide-react';
import Card from '../common/Card.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Button from '../common/Button.jsx';
import { formatDateTime } from '../../utils/format.js';

const STATUS_TONE = {
  Pending: 'bg-status-neutralBg text-status-neutral',
  Syncing: 'bg-status-infoBg text-status-info',
  Synced: 'bg-status-successBg text-status-success',
  Failed: 'bg-status-dangerBg text-status-danger',
};

const TYPE_LABEL = { flag: 'Flag', observation: 'Safety Observation', attendance: 'Attendance' };

export default function SyncQueuePanel({ items, isOnline, syncing, onSyncAll, onRetry }) {
  const pendingCount = items.filter((i) => i.syncStatus !== 'Synced').length;

  return (
    <Card padded={false}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
          <Clock size={14} /> Pending Sync: {pendingCount}
        </h3>
        {isOnline && pendingCount > 0 && (
          <Button size="sm" variant="secondary" icon={RefreshCw} onClick={onSyncAll} disabled={syncing}>
            {syncing ? 'Syncing…' : 'Sync now'}
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState title="Nothing queued" description="Reports captured in the field will appear here until synced." />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.localId} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-ink-900">{TYPE_LABEL[item.type] || item.type}</p>
                <p className="truncate font-mono text-xs text-ink-500">{item.localId}</p>
                <p className="text-xs text-ink-500">Captured (device time): {formatDateTime(item.createdAt)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`rounded-sm px-2 py-0.5 text-xs font-medium ${STATUS_TONE[item.syncStatus] || STATUS_TONE.Pending}`}>
                  {item.syncStatus}
                </span>
                {item.syncStatus === 'Failed' && (
                  <Button size="sm" variant="secondary" onClick={() => onRetry(item.localId)}>
                    Retry ({item.retryCount || 0})
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
