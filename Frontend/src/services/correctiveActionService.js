import { apiClient, USE_MOCKS, mockDelay } from './api.js';
import { mockCorrectiveActions } from '../data/mockData.js';

let actions = [...mockCorrectiveActions];

async function getCorrectiveActions() {
  if (USE_MOCKS) return mockDelay(actions);
  return apiClient.get('/corrective-actions'); // GET /corrective-actions
}

async function getOverdueActions() {
  if (USE_MOCKS) return mockDelay(actions.filter((a) => a.isOverdue));
  return apiClient.get('/corrective-actions?overdue=true');
}

async function getCorrectiveActionsForFlag(flagId) {
  if (USE_MOCKS) return mockDelay(actions.filter((a) => a.flagId === flagId));
  return apiClient.get(`/corrective-actions?flagId=${flagId}`);
}

async function getCorrectiveActionsForMine(mineId) {
  if (USE_MOCKS) return mockDelay(actions.filter((a) => a.mineId === mineId));
  return apiClient.get(`/corrective-actions?mineId=${mineId}`);
}

async function getCorrectiveActionById(id) {
  if (USE_MOCKS) return mockDelay(actions.find((a) => a.id === id) ?? null);
  return apiClient.get(`/corrective-actions/${id}`);
}

async function updateCorrectiveAction(id, patch) {
  if (USE_MOCKS) {
    actions = actions.map((a) => (a.id === id ? { ...a, ...patch } : a));
    return mockDelay(actions.find((a) => a.id === id), 400);
  }
  return apiClient.patch(`/corrective-actions/${id}`, patch); // PATCH /corrective-actions/:id
}

async function addComment(id, comment) {
  if (USE_MOCKS) {
    const newComment = { id: `c${Date.now()}`, timestamp: new Date().toISOString(), ...comment };
    actions = actions.map((a) => (a.id === id ? { ...a, comments: [...(a.comments || []), newComment] } : a));
    return mockDelay(newComment, 350);
  }
  return apiClient.post(`/corrective-actions/${id}/comments`, comment);
}

export const correctiveActionService = {
  getCorrectiveActions,
  getOverdueActions,
  getCorrectiveActionsForFlag,
  getCorrectiveActionsForMine,
  getCorrectiveActionById,
  updateCorrectiveAction,
  addComment,
};
