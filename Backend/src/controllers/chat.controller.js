const { memoryStore } = require('../services/memoryStore');
const prisma = require('../config/db');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8001';

/**
 * Proxies streaming chat to ML service (Ollama gemma3:1b),
 * optionally retrieving context from RAG, and managing
 * persistent vs temporary memory.
 */
exports.handleChatStream = async (req, res) => {
  const { sessionId: rawSessionId, message, isPersistent = false, history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, message: 'Message text is required' });
  }

  const sessionId = rawSessionId || `session-${Date.now()}`;

  // 1. Prepare conversation history & persistence
  let contextHistory = [];
  if (Array.isArray(history) && history.length > 0) {
    contextHistory = history;
  } else if (!isPersistent) {
    const memSession = memoryStore.getSession(sessionId);
    if (memSession) {
      contextHistory = memSession.messages.map((m) => ({ role: m.role, content: m.content }));
    }
  } else {
    // If persistent, try loading recent messages from DB
    try {
      const dbMessages = await prisma.message.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        take: 10,
      });
      if (dbMessages && dbMessages.length > 0) {
        contextHistory = dbMessages.map((m) => ({ role: m.role, content: m.content }));
      }
    } catch (dbErr) {
      // If DB is not ready or fails, fallback to memory
      const memSession = memoryStore.getSession(sessionId);
      if (memSession) {
        contextHistory = memSession.messages.map((m) => ({ role: m.role, content: m.content }));
      }
    }
  }

  // 2. Query RAG context from ML service
  let ragContext = '';
  try {
    const ragRes = await fetch(`${ML_SERVICE_URL}/rag/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: message, top_k: 3 }),
    });
    if (ragRes.ok) {
      const ragData = await ragRes.json();
      const chunks = ragData.chunks || [];
      if (chunks.length > 0) {
        const joinedChunks = chunks
          .filter((c) => (c.score || 0) > 0.3)
          .map((c, idx) => `[Source ${idx + 1}: ${c.filename}]\n${c.content}`)
          .join('\n\n');
        if (joinedChunks.trim()) {
          ragContext = `RELEVANT CONTEXT DOCUMENTS:\n${joinedChunks}\n\nUse the above context to answer the user's query when relevant.`;
        }
      }
    }
  } catch (ragErr) {
    // Non-fatal if RAG query fails
    console.warn('RAG query skipped or failed:', ragErr.message);
  }

  // Record user message
  if (!isPersistent) {
    memoryStore.addMessage(sessionId, 'user', message);
  } else {
    try {
      // Ensure session exists in DB
      await prisma.chatSession.upsert({
        where: { id: sessionId },
        update: { updatedAt: new Date() },
        create: {
          id: sessionId,
          isPersistent: true,
          title: message.slice(0, 40) || 'New Chat',
        },
      });
      await prisma.message.create({
        data: {
          sessionId,
          role: 'user',
          content: message,
        },
      });
    } catch (dbErr) {
      console.warn('DB write failed for user message, using memory fallback:', dbErr.message);
      memoryStore.addMessage(sessionId, 'user', message);
    }
  }

  // 3. Set SSE response headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  let fullAssistantResponse = '';

  try {
    const mlResponse = await fetch(`${ML_SERVICE_URL}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        message,
        history: contextHistory,
        systemPrompt: ragContext || undefined,
      }),
    });

    if (!mlResponse.ok || !mlResponse.body) {
      const errText = await mlResponse.text();
      res.write(`data: ${JSON.stringify({ error: `ML service error: ${errText}` })}\n\n`);
      return res.end();
    }

    const reader = mlResponse.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkText = decoder.decode(value, { stream: true });
      res.write(chunkText);

      // Parse tokens from SSE to store assistant reply
      const lines = chunkText.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.token) {
              fullAssistantResponse += parsed.token;
            }
          } catch (_) {}
        }
      }
    }

    // 4. Record assistant message when stream concludes
    if (fullAssistantResponse) {
      if (!isPersistent) {
        memoryStore.addMessage(sessionId, 'assistant', fullAssistantResponse);
      } else {
        try {
          await prisma.message.create({
            data: {
              sessionId,
              role: 'assistant',
              content: fullAssistantResponse,
            },
          });
        } catch (dbErr) {
          console.warn('DB write failed for assistant message, using memory fallback:', dbErr.message);
          memoryStore.addMessage(sessionId, 'assistant', fullAssistantResponse);
        }
      }
    }

    res.end();
  } catch (err) {
    console.error('Streaming error in chat controller:', err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
};

/**
 * Get all sessions
 */
exports.getSessions = async (req, res) => {
  try {
    let dbSessions = [];
    try {
      dbSessions = await prisma.chatSession.findMany({
        where: { isPersistent: true },
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    } catch (dbErr) {
      console.warn('DB session fetch fallback to memory:', dbErr.message);
    }

    const memSessions = memoryStore.getAllSessions();
    res.status(200).json({
      success: true,
      sessions: [...dbSessions, ...memSessions],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create a new session
 */
exports.createSession = async (req, res) => {
  const { isPersistent = false, title = 'New Conversation' } = req.body;
  const sessionId = `session-${Date.now()}`;

  try {
    if (isPersistent) {
      try {
        const session = await prisma.chatSession.create({
          data: {
            id: sessionId,
            isPersistent: true,
            title,
          },
        });
        return res.status(201).json({ success: true, session });
      } catch (dbErr) {
        console.warn('Could not persist session to DB, using memory:', dbErr.message);
      }
    }

    const session = memoryStore.createSession(sessionId, title);
    res.status(201).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get messages for a session
 */
exports.getSessionMessages = async (req, res) => {
  const { id } = req.params;
  try {
    // Check memory first
    const memSession = memoryStore.getSession(id);
    if (memSession) {
      return res.status(200).json({ success: true, messages: memSession.messages });
    }

    // Check DB
    try {
      const dbSession = await prisma.chatSession.findUnique({
        where: { id },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
      if (dbSession) {
        return res.status(200).json({ success: true, messages: dbSession.messages });
      }
    } catch (dbErr) {
      console.warn('DB fetch error for session messages:', dbErr.message);
    }

    res.status(404).json({ success: false, message: 'Session not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a session
 */
exports.deleteSession = async (req, res) => {
  const { id } = req.params;
  try {
    memoryStore.deleteSession(id);
    try {
      await prisma.chatSession.delete({ where: { id } }).catch(() => {});
    } catch (_) {}
    res.status(200).json({ success: true, message: 'Session deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
