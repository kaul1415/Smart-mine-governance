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

export const correctiveActionService = { getCorrectiveActions, getOverdueActions };
