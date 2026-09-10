import { useState } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function normalizeAssistantMarkdown(content = '') {
  // Gemma sometimes emits bold numbered labels inside one paragraph. Give the
  // markdown parser real line breaks so the response remains easy to scan.
  return content
    .replace(/\s+\*\*(\d+\.\s+[^*\n]{3,}):\*\*/g, '\n\n### $1\n')
    .replace(/\s+\*\*([A-Z][^*\n]{3,}):\*\*/g, '\n\n### $1\n');
}

// Lightweight markdown renderer with CoalGov design system styling
function MarkdownContent({ content }) {
  return (
    <ReactMarkdown
      components={{
        // Headings
        h1: ({ children }) => (
          <h1 className="mb-2 mt-3 text-base font-bold text-ink-900 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-1.5 mt-3 text-sm font-bold text-ink-900 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-1 mt-2 text-sm font-semibold text-ink-800 first:mt-0">{children}</h3>
        ),

        // Paragraph — no extra margin on first/last
        p: ({ children }) => (
          <p className="mb-2 leading-relaxed last:mb-0">{children}</p>
        ),

        // Bold & Italic
        strong: ({ children }) => (
          <strong className="font-semibold text-ink-900">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-ink-700">{children}</em>
        ),

        // Unordered list
        ul: ({ children }) => (
          <ul className="mb-2 ml-4 list-disc space-y-0.5 last:mb-0">{children}</ul>
        ),
        // Ordered list
        ol: ({ children }) => (
          <ol className="mb-2 ml-4 list-decimal space-y-0.5 last:mb-0">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed text-ink-800">{children}</li>
        ),

        // Inline code
        code: ({ inline, children }) =>
          inline ? (
            <code className="rounded bg-surface-sunken px-1 py-0.5 font-mono text-[11px] text-brand-700">
              {children}
            </code>
          ) : (
            <pre className="my-2 overflow-x-auto rounded-md border border-border bg-surface-sunken p-3">
              <code className="font-mono text-[11px] leading-relaxed text-ink-900">
                {children}
              </code>
            </pre>
          ),

        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="my-2 border-l-2 border-brand-400 pl-3 text-ink-600 italic">
            {children}
          </blockquote>
        ),

        // Horizontal rule
        hr: () => <hr className="my-2 border-border" />,

        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-700 underline hover:text-brand-900"
          >
            {children}
          </a>
        ),

        // Table
        table: ({ children }) => (
          <div className="my-2 overflow-x-auto rounded-md border border-border">
            <table className="w-full text-xs">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-surface-sunken text-ink-700">{children}</thead>
        ),
        tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
        tr: ({ children }) => <tr className="divide-x divide-border">{children}</tr>,
        th: ({ children }) => (
          <th className="px-3 py-1.5 text-left font-semibold">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-1.5 text-ink-800">{children}</td>
        ),
      }}
    >
      {normalizeAssistantMarkdown(content)}
    </ReactMarkdown>
  );
}

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
      {/* Avatar */}
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-brand-100 text-brand-800' : 'bg-surface-sunken text-brand-700'
        }`}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </span>

      {/* Bubble */}
      <div className={`flex ${isUser ? 'max-w-[78%] items-end' : 'w-full max-w-4xl items-start'} flex-col`}>
        <div
          className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-brand-800 text-white'
              : 'w-full border border-border bg-surface-card text-ink-900 shadow-xs'
          }`}
        >
          {isUser ? (
            // User messages: plain text (no markdown needed)
            <span className="whitespace-pre-wrap">{message.content}</span>
          ) : (
            // AI messages: full markdown rendering
            <MarkdownContent content={message.content} />
          )}
        </div>

        {/* Footer: copy button + sources */}
        {!isUser && (
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-ink-400 hover:text-ink-800 transition-colors"
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>

            {message.sources?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {message.sources.map((s) => (
                  <span
                    key={s}
                    className="rounded-sm bg-brand-50 px-1.5 py-0.5 font-mono text-[10px] text-brand-700 border border-brand-200"
                  >
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
