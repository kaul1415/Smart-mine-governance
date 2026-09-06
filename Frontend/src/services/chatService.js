import { apiClient, USE_MOCKS, mockDelay } from './api.js';
import {
  mockChatConversations,
  mockMines,
  mockRiskScores,
  mockFlags,
  mockCorrectiveActions,
  mockContractors,
  mockContractorPerformance,
  mockComplianceRequirements,
  mockRecurringIssues,
} from '../data/mockData.js';

let conversations = [...mockChatConversations];

function sortedByRecency() {
  return [...conversations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getConversations() {
  if (USE_MOCKS) return mockDelay(sortedByRecency());
  return apiClient.get('/chats'); // GET /chats
}

async function getConversation(id) {
  if (USE_MOCKS) return mockDelay(conversations.find((c) => c.id === id) ?? null);
  return apiClient.get(`/chats/${id}/messages`); // GET /chats/:id/messages
}

async function createConversation() {
  if (USE_MOCKS) {
    const newConv = { id: `chat-${Date.now()}`, title: 'New Chat', createdAt: new Date().toISOString(), messages: [] };
    conversations = [newConv, ...conversations];
    return mockDelay(newConv, 200);
  }
  return apiClient.post('/chats', {}); // POST /chats
}

async function renameConversation(id, title) {
  if (USE_MOCKS) {
    conversations = conversations.map((c) => (c.id === id ? { ...c, title } : c));
    return mockDelay(true, 200);
  }
  return apiClient.patch(`/chats/${id}`, { title });
}

async function deleteConversation(id) {
  if (USE_MOCKS) {
    conversations = conversations.filter((c) => c.id !== id);
    return mockDelay(true, 200);
  }
  return apiClient.delete(`/chats/${id}`);
}

// NOTE: this is a mock stand-in for the real RAG/AI backend. In real
// mode, sendMessage only ever posts the user's message and returns
// whatever the backend/AI service responds with — no answer
// generation happens in the browser.
function generateMockReply(query) {
  const q = query.toLowerCase();

  const mineMatch = mockMines.find((m) => q.includes(m.name.toLowerCase().split(' — ')[0].toLowerCase()) || q.includes(m.id.replace('mine-', 'mine ')));
  if (mineMatch && (q.includes('risk') || q.includes('why'))) {
    const risk = mockRiskScores.find((r) => r.mineId === mineMatch.id);
    if (risk) {
      const top = [...risk.contributors].sort((a, b) => b.weight - a.weight).slice(0, 2).map((c) => c.label.toLowerCase());
      return {
        content: `${mineMatch.name}'s risk score is ${risk.score}/100 (${risk.level}), ${risk.trend === 'up' ? 'up' : 'down'} from ${risk.previousScore} last month. The leading contributors are ${top.join(' and ')}.`,
        sources: [mineMatch.name, ...risk.contributors.map((c) => c.label)],
      };
    }
  }

  if (q.includes('overdue')) {
    const overdue = mockCorrectiveActions.filter((a) => a.isOverdue);
    if (overdue.length === 0) return { content: 'There are no overdue corrective actions right now.', sources: [] };
    return {
      content: `There ${overdue.length === 1 ? 'is' : 'are'} ${overdue.length} overdue corrective action(s): ${overdue.map((a) => `${a.id} (${a.issue}, ${a.mineName})`).join('; ')}.`,
      sources: overdue.map((a) => a.id),
    };
  }

  if (q.includes('high-severity') || q.includes('high severity') || (q.includes('flag') && q.includes('unresolved'))) {
    const open = mockFlags.filter((f) => f.severity === 'HIGH' && !['Resolved', 'Dismissed', 'Closed'].includes(f.status));
    if (open.length === 0) return { content: 'There are no unresolved high-severity flags right now.', sources: [] };
    return {
      content: `${open.length} unresolved high-severity flag(s): ${open.map((f) => `${f.id} (${f.category}, ${f.mineName})`).join('; ')}.`,
      sources: open.map((f) => f.id),
    };
  }

  if (q.includes('contractor') && q.includes('risk')) {
    const riskiest = [...mockContractors].sort((a, b) => b.riskScore - a.riskScore)[0];
    return {
      content: `${riskiest.name} currently has the highest risk among contractors, at ${riskiest.riskScore}/100 (${riskiest.riskLevel}), operating primarily at ${riskiest.primaryMineName}.`,
      sources: [riskiest.name],
    };
  }

  if (q.includes('contractor') && q.includes('performance')) {
    const sorted = [...mockContractors].map((c) => ({ ...c, overall: mockContractorPerformance[c.id]?.overall ?? 0 })).sort((a, b) => a.overall - b.overall);
    const lowest = sorted[0];
    const highest = sorted[sorted.length - 1];
    return {
      content: `${lowest.name} has the lowest overall performance at ${lowest.overall}%. ${highest.name} leads at ${highest.overall}%.`,
      sources: [lowest.name, highest.name],
    };
  }

  if (q.includes('compliance') && q.includes('due')) {
    const dueSoon = mockComplianceRequirements.filter((c) => c.status === 'Due Soon' || c.status === 'Overdue');
    if (dueSoon.length === 0) return { content: 'No compliance requirements are due soon.', sources: [] };
    return {
      content: `${dueSoon.length} requirement(s) due soon or overdue: ${dueSoon.map((c) => `${c.requirement} (${c.mineName})`).join('; ')}.`,
      sources: dueSoon.map((c) => c.id),
    };
  }

  if (q.includes('recurring')) {
    if (mockRecurringIssues.length === 0) return { content: 'No recurring issues detected right now.', sources: [] };
    const top = mockRecurringIssues[0];
    return {
      content: `The most significant recurring issue is "${top.issueType}" at ${top.mineName} — ${top.occurrencesLast3Months} occurrence(s) in the last 3 months, involving ${top.contractorInvolved}. Recommendation: ${top.recommendation}`,
      sources: mockRecurringIssues.map((i) => i.issueType),
    };
  }

  return {
    content:
      "I can answer questions about mine risk, flags, corrective actions, compliance, contractors, and recurring issues. Try asking about a specific mine, or one of the suggested questions.",
    sources: [],
  };
}

async function sendMessage(conversationId, text) {
  const userMessage = { id: `m${Date.now()}`, role: 'user', content: text, timestamp: new Date().toISOString() };

  if (USE_MOCKS) {
    conversations = conversations.map((c) =>
      c.id === conversationId
        ? { ...c, title: c.messages.length === 0 ? text : c.title, messages: [...c.messages, userMessage] }
        : c
    );
    const reply = generateMockReply(text);
    const assistantMessage = {
      id: `m${Date.now() + 1}`,
      role: 'assistant',
      content: reply.content,
      sources: reply.sources,
      timestamp: new Date().toISOString(),
    };
    await mockDelay(null, 700);
    conversations = conversations.map((c) => (c.id === conversationId ? { ...c, messages: [...c.messages, assistantMessage] } : c));
    return conversations.find((c) => c.id === conversationId);
  }

  return apiClient.post(`/chats/${conversationId}/messages`, { content: text }); // POST /chats/:id/messages
}

export const chatService = {
  getConversations,
  getConversation,
  createConversation,
  renameConversation,
  deleteConversation,
  sendMessage,
};
