import { apiClient, USE_MOCKS, mockDelay } from './api.js';
import { mockCorrectiveActions } from '../data/mockData.js';

async function getCorrectiveActions() {
  if (USE_MOCKS) return mockDelay(mockCorrectiveActions);
  return apiClient.get('/corrective-actions'); // GET /corrective-actions
}

async function getOverdueActions() {
  if (USE_MOCKS) return mockDelay(mockCorrectiveActions.filter((a) => a.isOverdue));
  return apiClient.get('/corrective-actions?overdue=true');
}

async function getCorrectiveActionsForFlag(flagId) {
  if (USE_MOCKS) return mockDelay(mockCorrectiveActions.filter((a) => a.flagId === flagId));
  return apiClient.get(`/corrective-actions?flagId=${flagId}`);
}

async function getCorrectiveActionById(id) {
  if (USE_MOCKS) return mockDelay(mockCorrectiveActions.find((a) => a.id === id) ?? null);
  return apiClient.get(`/corrective-actions/${id}`);
}

export const correctiveActionService = {
  getCorrectiveActions,
  getOverdueActions,
  getCorrectiveActionsForFlag,
  getCorrectiveActionById,
};
