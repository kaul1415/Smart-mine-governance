import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import SearchInput from '../common/SearchInput.jsx';

function groupLabel(createdAt) {
  const date = new Date(createdAt);
  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return 'This Week';
  return 'Older';
}

export default function ChatSidebar({ conversations, activeId, onSelect, onNewChat, onRename, onDelete, isOpen, onClose }) {
  const [search, setSearch] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const filtered = conversations.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.title.toLowerCase().includes(q) || c.messages.some((m) => m.content.toLowerCase().includes(q));
  });

  const groups = filtered.reduce((acc, c) => {
    const label = groupLabel(c.createdAt);
    acc[label] = acc[label] || [];
    acc[label].push(c);
    return acc;
  }, {});
  const groupOrder = ['Today', 'Yesterday', 'This Week', 'Older'].filter((g) => groups[g]?.length);

  function startRename(c) {
    setRenamingId(c.id);
    setRenameValue(c.title);
  }

  function confirmRename(id) {
    if (renameValue.trim()) onRename(id, renameValue.trim());
    setRenamingId(null);
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-ink-900/40 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface-card transition-transform lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-2 p-3">
          <button
            onClick={onNewChat}
            className="flex flex-1 items-center justify-center gap-1.5 rounded bg-brand-800 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus size={15} /> New Chat
          </button>
          <button onClick={onClose} className="rounded p-2 text-ink-500 hover:bg-surface-sunken lg:hidden" aria-label="Close chat list">
            <X size={16} />
          </button>
        </div>
        <div className="px-3 pb-2">
          <SearchInput value={search} onChange={setSearch} placeholder="Search chats…" />
        </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {groupOrder.length === 0 && <p className="px-2 py-4 text-xs text-ink-500">No chats found.</p>}
        {groupOrder.map((label) => (
          <div key={label} className="mb-3">
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-500">{label}</p>
            <ul className="space-y-0.5">
              {groups[label].map((c) => (
                <li key={c.id} className="group relative">
                  {renamingId === c.id ? (
                    <div className="flex items-center gap-1 px-1.5 py-1">
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && confirmRename(c.id)}
                        className="min-w-0 flex-1 rounded border border-border-strong px-1.5 py-1 text-xs"
                      />
                      <button onClick={() => confirmRename(c.id)} className="text-status-success">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setRenamingId(null)} className="text-ink-500">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`flex w-full items-center justify-between gap-1 rounded pr-1.5 text-sm ${
                        activeId === c.id ? 'bg-brand-100 text-brand-900' : 'text-ink-700 hover:bg-surface-sunken'
                      }`}
                    >
                      <button
                        onClick={() => onSelect(c.id)}
                        className="min-w-0 flex-1 truncate px-2.5 py-2 text-left"
                      >
                        {c.title}
                      </button>
                      <span className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
                        <button
                          onClick={() => startRename(c)}
                          aria-label={`Rename "${c.title}"`}
                          className="rounded p-1 text-ink-500 hover:bg-surface-card hover:text-ink-900"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => onDelete(c.id)}
                          aria-label={`Delete "${c.title}"`}
                          className="rounded p-1 text-ink-500 hover:bg-surface-card hover:text-status-danger"
                        >
                          <Trash2 size={12} />
                        </button>
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
