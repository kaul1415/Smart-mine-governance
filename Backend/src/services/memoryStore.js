// In-memory session store for temporary / "once chat" mode
// When isPersistent is false, messages are held only here during the runtime lifecycle
class MemoryStore {
  constructor() {
    this.sessions = new Map();
  }

  createSession(id = `temp-${Date.now()}`, title = 'Temporary Chat', userId = 'anonymous') {
    const session = {
      id,
      userId: String(userId || 'anonymous'),
      isPersistent: false,
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.sessions.set(id, session);
    return session;
  }

  getSession(id, userId = null) {
    const session = this.sessions.get(id);
    if (!session) return null;
    if (userId && session.userId && session.userId !== String(userId)) {
      return null;
    }
    return session;
  }

  addMessage(sessionId, role, content, userId = null) {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = this.createSession(sessionId, 'Temporary Chat', userId || 'anonymous');
    } else if (userId && (session.userId === 'anonymous' || !session.userId)) {
      session.userId = String(userId);
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

  deleteSession(id, userId = null) {
    const session = this.sessions.get(id);
    if (!session) return false;
    if (userId && session.userId && session.userId !== String(userId)) {
      return false;
    }
    return this.sessions.delete(id);
  }

  getSessionsForUser(userId) {
    if (!userId) return [];
    const uid = String(userId);
    return Array.from(this.sessions.values()).filter((s) => s.userId === uid);
  }

  clearUserSessions(userId) {
    if (!userId) return;
    const uid = String(userId);
    for (const [id, s] of this.sessions.entries()) {
      if (s.userId === uid) {
        this.sessions.delete(id);
      }
    }
  }

  getAllSessions() {
    return Array.from(this.sessions.values());
  }
}

const memoryStore = new MemoryStore();
module.exports = { memoryStore };

