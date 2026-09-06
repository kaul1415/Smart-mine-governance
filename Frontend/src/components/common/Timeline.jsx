import { Bot, User } from 'lucide-react';
import { formatDateTime } from '../../utils/format.js';

/**
 * items: [{ id, timestamp, actor, actorType: 'user'|'system', action, entity? }]
 */
export default function Timeline({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <ol className="relative ml-3 space-y-5 border-l border-border pl-5">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span
            className={`absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full ${
              item.actorType === 'system' ? 'bg-brand-100 text-brand-700' : 'bg-status-infoBg text-status-info'
            }`}
          >
            {item.actorType === 'system' ? <Bot size={11} /> : <User size={11} />}
          </span>
          <p className="text-sm text-ink-900">
            <span className="font-medium">{item.actor}</span> {item.action}
            {item.entity && <span className="ml-1 font-mono text-xs text-ink-500">{item.entity}</span>}
          </p>
          <p className="text-xs text-ink-500">{formatDateTime(item.timestamp)}</p>
        </li>
      ))}
    </ol>
  );
}
