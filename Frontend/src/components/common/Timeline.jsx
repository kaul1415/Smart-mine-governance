import { Bot, User, ShieldCheck } from 'lucide-react';
import { formatDateTime } from '../../utils/format.js';

/**
 * items: [{ id, timestamp, actor, actorType: 'user'|'system', action, entity?, hash?, previousHash? }]
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
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs text-ink-500">{formatDateTime(item.timestamp)}</p>
            {item.hash && (
              <span
                className="inline-flex items-center gap-1 font-mono text-[10px] text-ink-400 bg-surface-sunken px-1.5 py-0.5 rounded"
                title={`Cryptographic Hash: ${item.hash}`}
              >
                <ShieldCheck size={10} className="text-status-success" />
                <span>SHA-256: {item.hash.substring(0, 12)}…</span>
              </span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
