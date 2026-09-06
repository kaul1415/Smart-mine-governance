import Card from '../common/Card.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { AlertOctagon, Clock, Flag, Bot } from 'lucide-react';

const ALERT_ICON = {
  'HIGH RISK': AlertOctagon,
  OVERDUE: Clock,
  FLAG: Flag,
  'AI ALERT': Bot,
};

const ALERT_TONE = {
  'HIGH RISK': 'text-status-danger',
  OVERDUE: 'text-status-warning',
  FLAG: 'text-status-info',
  'AI ALERT': 'text-brand-700',
};

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function RecentAlertsList({ alerts }) {
  return (
    <Card padded={false}>
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-ink-900">Recent Alerts</h3>
      </div>
      {alerts.length === 0 ? (
        <EmptyState title="No alerts" description="System and AI-generated alerts will appear here." />
      ) : (
        <ul className="divide-y divide-border">
          {alerts.map((alert) => {
            const Icon = ALERT_ICON[alert.type] || AlertOctagon;
            return (
              <li key={alert.id} className="flex items-start gap-3 px-5 py-3">
                <Icon size={16} className={`mt-0.5 shrink-0 ${ALERT_TONE[alert.type] || 'text-ink-500'}`} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{alert.type}</p>
                  <p className="text-sm text-ink-900">{alert.message}</p>
                  <p className="text-xs text-ink-500">{formatTime(alert.timestamp)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
