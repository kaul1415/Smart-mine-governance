// In-memory session store for temporary / "once chat" mode
// When isPersistent is false, messages are held only here during the runtime lifecycle
class MemoryStore {
  constructor() {
    this.sessions = new Map();
  }

  createSession(id = `temp-${Date.now()}`, title = 'Temporary Chat') {
    const session = {
      id,
      isPersistent: false,
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.sessions.set(id, session);
    return session;
  }

  getSession(id) {
    return this.sessions.get(id) || null;
  }

  addMessage(sessionId, role, content) {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = this.createSession(sessionId);
    }
    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sessionId,
      role,
      content,
      createdAt: new Date().toISOString(),
    };
    session.messages.push(msg);
    session.updatedAt = new Date().toISOString();
    return msg;
  }

  deleteSession(id) {
    return this.sessions.delete(id);
  }

  getAllSessions() {
    return Array.from(this.sessions.values());
  }
}

const memoryStore = new MemoryStore();
module.exports = { memoryStore };
