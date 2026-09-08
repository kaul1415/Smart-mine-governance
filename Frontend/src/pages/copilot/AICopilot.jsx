import { useEffect, useRef, useState } from 'react';
import { Send, Bot, AlertTriangle, Menu } from 'lucide-react';
import ChatSidebar from '../../components/copilot/ChatSidebar.jsx';
import ChatMessage from '../../components/copilot/ChatMessage.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import Button from '../../components/common/Button.jsx';
import { chatService } from '../../services/chatService.js';
import { CHAT_SUGGESTED_QUESTIONS } from '../../data/mockData.js';

export default function AICopilot() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [input, setInput] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const scrollRef = useRef(null);

  async function loadConversations(selectId) {
    setLoadingList(true);
    try {
      const list = await chatService.getConversations();
      setConversations(list);
      if (selectId) setActiveId(selectId);
      else if (!activeId && list.length > 0) setActiveId(list[0].id);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [conversations, activeId]);

  const active = conversations.find((c) => c.id === activeId);

  async function handleNewChat() {
    const conv = await chatService.createConversation();
    await loadConversations(conv.id);
  }

  async function handleSelect(id) {
    setActiveId(id);
    setMobileSidebarOpen(false);
  }

  async function handleRename(id, title) {
    await chatService.renameConversation(id, title);
    await loadConversations(activeId);
  }

  async function handleDelete(id) {
    await chatService.deleteConversation(id);
    const wasActive = id === activeId;
    if (wasActive) setActiveId(null);
    await loadConversations();
  }

  async function handleSend(text) {
    const message = (text ?? input).trim();
    if (!message) return;
    setInput('');
    setError(null);
    let conversationId = activeId;
    if (!conversationId) {
      const conv = await chatService.createConversation();
      conversationId = conv.id;
      setActiveId(conversationId);
      setConversations((prev) => [conv, ...prev]);
    }
    setSending(true);
    try {
      const updated = await chatService.sendMessage(conversationId, message);
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === updated.id);
        return exists ? prev.map((c) => (c.id === updated.id ? updated : c)) : [updated, ...prev];
      });
    } catch (err) {
      setError(err.message || 'Something went wrong sending that message.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="-m-4 flex h-[calc(100vh-4rem)] sm:-m-6 lg:-m-8">
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNewChat={handleNewChat}
        onRename={handleRename}
        onDelete={handleDelete}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="rounded p-1.5 text-ink-700 hover:bg-surface-sunken lg:hidden"
            aria-label="Open chat list"
          >
            <Menu size={18} />
          </button>
          <Bot size={17} className="text-brand-700" />
          <h1 className="text-sm font-semibold text-ink-900">AI Copilot</h1>
          <span className="hidden text-xs text-ink-500 sm:inline">— ask about mine risk, flags, compliance, or contractors</span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
          {loadingList ? (
            <LoadingState label="Loading chats…" />
          ) : !active || active.messages.length === 0 ? (
            <div className="mx-auto max-w-lg py-10 text-center">
              <Bot size={28} className="mx-auto mb-3 text-brand-700" />
              <p className="mb-4 text-sm text-ink-500">Ask about any mine, flag, contractor, or compliance requirement.</p>
              <div className="flex flex-col gap-2">
                {CHAT_SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="rounded border border-border bg-surface-card px-3.5 py-2 text-left text-sm text-ink-700 hover:border-brand-600 hover:text-brand-800"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {active.messages.map((m) => (
                <ChatMessage key={m.id} message={m} />
              ))}
              {sending && (
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <Bot size={14} className="text-brand-700" /> Thinking…
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 rounded border border-status-dangerBg bg-status-dangerBg px-3 py-2 text-xs text-status-danger">
                  <AlertTriangle size={13} /> {error}
                </div>
              )}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 border-t border-border p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the governance copilot…"
            className="flex-1 rounded border border-border-strong px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-brand-600"
          />
          <Button type="submit" icon={Send} disabled={sending || !input.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
