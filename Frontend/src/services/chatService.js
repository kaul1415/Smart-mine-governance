import { API_BASE_URL } from './api.js';

let localConversations = [];

/**
 * Streams chat tokens from the backend using fetch and ReadableStream
 */
export async function streamChatMessage({
  sessionId,
  message,
  isPersistent = false,
  onToken,
  onComplete,
  onError,
}) {
  try {
    const token = localStorage.getItem('minegov_auth_token');
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        sessionId,
        message,
        isPersistent,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Chat request failed (${response.status}): ${errText}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported by response');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulatedText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);
            if (data.token) {
              accumulatedText += data.token;
              if (onToken) onToken(data.token, accumulatedText);
            }
            if (data.error) {
              if (onError) onError(new Error(data.error));
            }
          } catch (parseErr) {
            // Non-json SSE data line
          }
        }
      }
    }

    if (onComplete) onComplete(accumulatedText);
    return accumulatedText;
  } catch (err) {
    if (onError) onError(err);
    throw err;
  }
}

/**
 * Get chat sessions
 */
export async function getConversations() {
  try {
    const res = await fetch(`${API_BASE_URL}/sessions`);
    if (res.ok) {
      const data = await res.json();
      if (data.sessions) {
        return data.sessions.map((s) => ({
          id: s.id,
          title: s.title || 'Conversation',
          isPersistent: s.isPersistent,
          createdAt: s.createdAt,
          messages: s.messages || [],
        }));
      }
    }
  } catch (e) {
    console.warn('Backend sessions fetch failed, fallback to local:', e.message);
  }
  return localConversations;
}

/**
 * Get messages for a session
 */
export async function getConversation(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/sessions/${id}/messages`);
    if (res.ok) {
      const data = await res.json();
      return {
        id,
        messages: data.messages || [],
      };
    }
  } catch (e) {
    console.warn('Session messages fetch failed:', e.message);
  }
  return localConversations.find((c) => c.id === id) || null;
}

/**
 * Create a new conversation session
 */
export async function createConversation(isPersistent = false, title = 'New Chat') {
  const newConv = {
    id: `session-${Date.now()}`,
    title,
    isPersistent,
    createdAt: new Date().toISOString(),
    messages: [],
  };

  try {
    const res = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPersistent, title }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.session) {
        return {
          ...data.session,
          messages: [],
        };
      }
    }
  } catch (e) {
    console.warn('Create session API failed, using client session:', e.message);
  }

  localConversations = [newConv, ...localConversations];
  return newConv;
}

/**
 * Delete a session
 */
export async function deleteConversation(id) {
  try {
    await fetch(`${API_BASE_URL}/sessions/${id}`, { method: 'DELETE' });
  } catch (e) {
    console.warn('Delete session API failed:', e.message);
  }
  localConversations = localConversations.filter((c) => c.id !== id);
  return true;
}

/**
 * Rename a session
 */
export async function renameConversation(id, title) {
  localConversations = localConversations.map((c) => (c.id === id ? { ...c, title } : c));
  return true;
}

/**
 * Upload document for RAG indexing
 */
export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/documents`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload failed: ${err}`);
  }

  return await res.json();
}

/**
 * Get ingested documents list
 */
export async function getDocuments() {
  try {
    const res = await fetch(`${API_BASE_URL}/documents`);
    if (res.ok) {
      const data = await res.json();
      return data.documents || [];
    }
  } catch (e) {
    console.warn('Get documents failed:', e.message);
  }
  return [];
}

export const chatService = {
  streamChatMessage,
  getConversations,
  getConversation,
  createConversation,
  deleteConversation,
  renameConversation,
  uploadDocument,
  getDocuments,
};
