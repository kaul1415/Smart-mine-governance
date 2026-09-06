import { useState } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';

export default function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  function handleCopy() {
    navigator.clipboard?.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-brand-100 text-brand-800' : 'bg-surface-sunken text-brand-700'
        }`}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </span>
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`rounded-md px-3.5 py-2.5 text-sm ${isUser ? 'bg-brand-800 text-white' : 'border border-border bg-surface-card text-ink-900'}`}>
          {message.content}
        </div>
        {!isUser && (
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-ink-500 hover:text-ink-900">
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            {message.sources?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {message.sources.map((s) => (
                  <span key={s} className="rounded-sm bg-surface-sunken px-1.5 py-0.5 font-mono text-[10px] text-ink-500">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
