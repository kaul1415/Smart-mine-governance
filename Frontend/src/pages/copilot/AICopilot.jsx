import { useEffect, useRef, useState } from 'react';
import {
  Send,
  Bot,
  AlertTriangle,
  Menu,
  FileText,
  Upload,
  CheckCircle2,
  Database,
  Zap,
  X,
  RefreshCw,
  Trash2,
  Server,
} from 'lucide-react';
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

  // Persistence toggle: Persistent (DB) vs Temporary ("Once Chat")
  const [isPersistent, setIsPersistent] = useState(false);

  // RAG Document Drawer / Modal state
  const [ragDrawerOpen, setRagDrawerOpen] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [indexedDocs, setIndexedDocs] = useState([]);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  async function loadConversations(selectId) {
    setLoadingList(true);
    try {
      const list = await chatService.getConversations();
      setConversations(list);
      if (selectId) {
        setActiveId(selectId);
      } else if (!activeId && list.length > 0) {
        setActiveId(list[0].id);
        setIsPersistent(list[0].isPersistent ?? false);
      }
    } catch (e) {
      console.warn('Failed to load conversations:', e);
    } finally {
      setLoadingList(false);
    }
  }

  async function loadDocuments() {
    try {
      const docs = await chatService.getDocuments();
      setIndexedDocs(docs);
    } catch (e) {
      console.warn('Failed to load indexed documents:', e);
    }
  }

  useEffect(() => {
    loadConversations();
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [conversations, activeId, sending]);

  const active = conversations.find((c) => c.id === activeId);

  async function handleNewChat(persistentOverride) {
    const persist = persistentOverride !== undefined ? persistentOverride : isPersistent;
    const conv = await chatService.createConversation(
      persist,
      persist ? 'Saved Conversation' : 'Temporary Chat'
    );
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
  }

  async function handleSelect(id) {
    setActiveId(id);
    setMobileSidebarOpen(false);
    const selected = conversations.find((c) => c.id === id);
    if (selected) {
      setIsPersistent(selected.isPersistent ?? false);
      // Load full messages if not loaded
      if (!selected.messages || selected.messages.length === 0) {
        const full = await chatService.getConversation(id);
        if (full && full.messages) {
          setConversations((prev) =>
            prev.map((c) => (c.id === id ? { ...c, messages: full.messages } : c))
          );
        }
      }
    }
  }

  async function handleRename(id, title) {
    await chatService.renameConversation(id, title);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    );
  }

  async function handleDelete(id) {
    await chatService.deleteConversation(id);
    const remaining = conversations.filter((c) => c.id !== id);
    setConversations(remaining);
    if (id === activeId) {
      setActiveId(remaining.length > 0 ? remaining[0].id : null);
    }
  }

  async function handleWipeTemporaryChat() {
    if (!activeId) return;
    await chatService.deleteConversation(activeId);
    setConversations((prev) => prev.filter((c) => c.id !== activeId));
    handleNewChat(false);
  }

  async function handleSend(text) {
    const message = (text ?? input).trim();
    if (!message || sending) return;

    setInput('');
    setError(null);

    let conversationId = activeId;
    if (!conversationId) {
      const conv = await chatService.createConversation(
        isPersistent,
        isPersistent ? 'Saved Conversation' : 'Temporary Chat'
      );
      conversationId = conv.id;
      setActiveId(conversationId);
      setConversations((prev) => [conv, ...prev]);
    }

    const userMessage = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };

    const assistantPlaceholderId = `msg-${Date.now()}-a`;
    const assistantMessage = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    };

    // Append user message & empty assistant placeholder immediately
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          const updatedMessages = [...(c.messages || []), userMessage, assistantMessage];
          return {
            ...c,
            title: c.messages.length === 0 ? message.slice(0, 30) : c.title,
            messages: updatedMessages,
          };
        }
        return c;
      })
    );

    setSending(true);

    try {
      await chatService.streamChatMessage({
        sessionId: conversationId,
        message,
        isPersistent,
        onToken: (_token, accumulated) => {
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === conversationId) {
                const updatedMessages = c.messages.map((m) =>
                  m.id === assistantPlaceholderId ? { ...m, content: accumulated } : m
                );
                return { ...c, messages: updatedMessages };
              }
              return c;
            })
          );
        },
        onComplete: (fullText) => {
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === conversationId) {
                const updatedMessages = c.messages.map((m) =>
                  m.id === assistantPlaceholderId ? { ...m, content: fullText } : m
                );
                return { ...c, messages: updatedMessages };
              }
              return c;
            })
          );
        },
        onError: (err) => {
          setError(err.message || 'Error occurred during streaming.');
        },
      });
    } catch (err) {
      setError(err.message || 'Failed to send message to AI Copilot.');
    } finally {
      setSending(false);
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const res = await chatService.uploadDocument(file);
      setUploadSuccess(`Ingested "${res.filename}" into RAG (${res.chunks_count} chunks indexed).`);
      await loadDocuments();
    } catch (err) {
      setUploadError(err.message || 'Failed to ingest document.');
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="-m-4 flex h-[calc(100vh-4rem)] sm:-m-6 lg:-m-8">
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNewChat={() => handleNewChat()}
        onRename={handleRename}
        onDelete={handleDelete}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col bg-surface-canvas">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-card px-5 py-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded p-1.5 text-ink-700 hover:bg-surface-sunken lg:hidden"
              aria-label="Open chat list"
            >
              <Menu size={18} />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-800 text-white shadow-xs">
              <Bot size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-ink-900">CoalGov AI Copilot</h1>
                <span className="rounded bg-brand-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-brand-700">
                  gemma3:1b
                </span>
              </div>
              <p className="text-xs text-ink-500">
                Governance, DGMS statutory compliance, and RAG knowledge assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Offline AI Server Indicator */}
            <div className="hidden items-center gap-1.5 rounded-full border border-status-success/30 bg-status-successBg px-2 py-1 text-[11px] font-medium text-status-success sm:flex">
              <Server size={12} />
              <span>Offline Server</span>
            </div>

            {/* Persistence Mode Toggle */}
            <div className="flex items-center gap-2 rounded-md border border-border bg-surface-sunken px-2.5 py-1.5">
              {isPersistent ? (
                <Database size={14} className="text-status-success" />
              ) : (
                <Zap size={14} className="text-status-warning" />
              )}
              <div className="flex flex-col">
                <span className="text-[11px] font-medium leading-none text-ink-900">
                  {isPersistent ? 'Persistent' : 'Once Chat'}
                </span>
                <span className="text-[9px] text-ink-500">
                  {isPersistent ? 'Saved to DB' : 'Temporary'}
                </span>
              </div>
              <label className="relative ml-1 inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={isPersistent}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setIsPersistent(next);
                    if (active && active.isPersistent !== next) {
                      handleNewChat(next);
                    }
                  }}
                  className="peer sr-only"
                />
                <div className="peer h-4 w-7 rounded-full bg-border-strong after:absolute after:left-[2px] after:top-[2px] after:h-3 after:w-3 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-800 peer-checked:after:translate-x-full"></div>
              </label>
            </div>

            {/* Wipe Temporary Chat Button (Only visible in Once Chat mode with messages) */}
            {!isPersistent && active && active.messages && active.messages.length > 0 && (
              <button
                onClick={handleWipeTemporaryChat}
                className="flex items-center gap-1 rounded border border-status-danger/30 bg-status-dangerBg/50 px-2 py-1.5 text-xs font-medium text-status-danger hover:bg-status-dangerBg"
                title="Immediately erase this temporary chat from memory"
              >
                <Trash2 size={12} />
                <span className="hidden sm:inline">Wipe Chat</span>
              </button>
            )}

            {/* RAG Knowledge Base Button */}
            <button
              onClick={() => setRagDrawerOpen(!ragDrawerOpen)}
              className="flex items-center gap-1.5 rounded border border-border bg-surface-card px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:border-brand-600 hover:text-brand-800"
            >
              <FileText size={14} className="text-brand-700" />
              <span>RAG Docs</span>
              {indexedDocs.length > 0 && (
                <span className="rounded-full bg-brand-800 px-1.5 py-0.2 text-[10px] text-white">
                  {indexedDocs.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* RAG Document Drawer / Modal */}
        {ragDrawerOpen && (
          <div className="border-b border-border bg-brand-100/40 p-4 transition-all">
            <div className="mx-auto max-w-3xl">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-brand-800" />
                  <h3 className="text-xs font-bold text-ink-900">
                    RAG Knowledge Base (nomic-embed-text + pgvector)
                  </h3>
                </div>
                <button
                  onClick={() => setRagDrawerOpen(false)}
                  className="rounded p-1 text-ink-500 hover:bg-surface-sunken"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Upload box */}
                <div className="rounded-md border border-dashed border-border-strong bg-surface-card p-3 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="rag-file-upload"
                  />
                  <label
                    htmlFor="rag-file-upload"
                    className="flex cursor-pointer flex-col items-center justify-center gap-1.5 py-2"
                  >
                    <Upload size={20} className="text-brand-700" />
                    <span className="text-xs font-medium text-ink-900">
                      Upload Document (PDF, TXT, MD)
                    </span>
                    <span className="text-[10px] text-ink-500">
                      Files are split into chunks & embedded via nomic-embed-text
                    </span>
                  </label>
                  {uploadingDoc && (
                    <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-brand-700">
                      <RefreshCw size={12} className="animate-spin" /> Ingesting & embedding chunks…
                    </div>
                  )}
                  {uploadSuccess && (
                    <div className="mt-2 flex items-center justify-center gap-1 text-xs text-status-success">
                      <CheckCircle2 size={12} /> {uploadSuccess}
                    </div>
                  )}
                  {uploadError && (
                    <div className="mt-2 text-xs text-status-danger">
                      {uploadError}
                    </div>
                  )}
                </div>

                {/* Document List */}
                <div className="rounded-md border border-border bg-surface-card p-3">
                  <span className="mb-2 block text-[11px] font-semibold text-ink-700">
                    Indexed Documents in Database:
                  </span>
                  {indexedDocs.length === 0 ? (
                    <p className="text-xs text-ink-500">No documents indexed yet. Upload one above!</p>
                  ) : (
                    <div className="max-h-28 space-y-1.5 overflow-y-auto">
                      {indexedDocs.map((doc, i) => (
                        <div
                          key={doc.document_id || i}
                          className="flex items-center justify-between rounded bg-surface-sunken px-2 py-1 text-xs text-ink-900"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <FileText size={12} className="text-brand-600" />
                            <span className="truncate">{doc.filename}</span>
                          </div>
                          <span className="text-[10px] text-ink-500">
                            {doc.chunks} chunks
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message Stream Display Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
          {loadingList ? (
            <LoadingState label="Loading chats…" />
          ) : !active || (active.messages || []).length === 0 ? (
            <div className="mx-auto max-w-lg py-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-800 shadow-xs">
                <Bot size={24} />
              </div>
              <h2 className="text-base font-semibold text-ink-900">
                How can CoalGov Copilot help you today?
              </h2>
              <p className="mb-6 mt-1 text-xs text-ink-500">
                Mode:{' '}
                <strong className={isPersistent ? 'text-status-success' : 'text-status-warning'}>
                  {isPersistent ? 'Persistent (Saved)' : 'Once Chat (Temporary)'}
                </strong>
                . Ask questions about mining safety, DGMS statutory compliance, or documents in your RAG index.
              </p>
              <div className="flex flex-col gap-2">
                {CHAT_SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="rounded border border-border bg-surface-card px-3.5 py-2.5 text-left text-xs font-medium text-ink-700 shadow-xs transition-colors hover:border-brand-600 hover:text-brand-800"
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
              {error && (
                <div className="flex items-center gap-2 rounded border border-status-dangerBg bg-status-dangerBg px-3 py-2 text-xs text-status-danger">
                  <AlertTriangle size={13} /> {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 border-t border-border bg-surface-card p-4 shadow-sm"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isPersistent
                ? 'Ask Copilot (Saved to DB session)…'
                : 'Ask Copilot (Temporary session)…'
            }
            disabled={sending}
            className="flex-1 rounded border border-border-strong bg-surface-canvas px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-brand-600 focus:bg-white focus:outline-none"
          />
          <Button type="submit" icon={Send} disabled={sending || !input.trim()}>
            {sending ? 'Streaming…' : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  );
}
