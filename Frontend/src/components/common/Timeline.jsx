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
          {item.hash && (
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span className="rounded bg-brand-50 px-1.5 py-0.5 font-semibold text-brand-700 border border-brand-200">
                Block #{item.blockIndex || 1}
              </span>
              <span className="rounded bg-surface-muted px-1.5 py-0.5 text-ink-600 border border-border" title={`SHA-256: ${item.hash}`}>
                ⛓️ {item.hash.slice(0, 16)}...{item.hash.slice(-8)}
              </span>
              {item.previousHash && (
                <span className="text-[10px] text-ink-400" title={`Previous Hash: ${item.previousHash}`}>
                  ⮑ Prev: {item.previousHash.slice(0, 8)}...
                </span>
              )}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
