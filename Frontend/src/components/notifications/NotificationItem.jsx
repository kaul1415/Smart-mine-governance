import { AlertOctagon, Clock, Flag, Bot, ShieldCheck } from 'lucide-react';
import { formatDateTime } from '../../utils/format.js';

const TYPE_ICON = {
  'HIGH RISK': AlertOctagon,
  OVERDUE: Clock,
  FLAG: Flag,
  'AI ALERT': Bot,
  COMPLIANCE: ShieldCheck,
};

const TYPE_TONE = {
  'HIGH RISK': 'text-status-danger',
  OVERDUE: 'text-status-warning',
  FLAG: 'text-status-info',
  'AI ALERT': 'text-brand-700',
  COMPLIANCE: 'text-status-success',
};

const PRIORITY_TONE = {
  HIGH: 'bg-status-dangerBg text-status-danger',
  MEDIUM: 'bg-status-warningBg text-status-warning',
  LOW: 'bg-status-neutralBg text-status-neutral',
};

export default function NotificationItem({ notification, onMarkRead }) {
  const Icon = TYPE_ICON[notification.type] || AlertOctagon;

  return (
    <li className={`flex items-start gap-3 px-4 py-3 ${!notification.read ? 'bg-brand-100/30' : ''}`}>
      <Icon size={17} className={`mt-0.5 shrink-0 ${TYPE_TONE[notification.type] || 'text-ink-500'}`} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">{notification.type}</span>
          {notification.priority && (
            <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-medium ${PRIORITY_TONE[notification.priority]}`}>
              {notification.priority}
            </span>
          )}
          {!notification.read && <span className="h-1.5 w-1.5 rounded-full bg-brand-700" aria-label="Unread" />}
        </div>
        <p className="mt-0.5 text-sm text-ink-900">{notification.message}</p>
        <p className="mt-0.5 text-xs text-ink-500">{formatDateTime(notification.timestamp)}</p>
      </div>
      {!notification.read && (
        <button
          onClick={() => onMarkRead(notification.id)}
          className="shrink-0 text-xs font-medium text-brand-700 hover:underline"
        >
          Mark read
        </button>
      )}
    </li>
  );
}
