import { apiClient, USE_MOCKS, mockDelay } from './api.js';
import { mockAlerts } from '../data/mockData.js';

async function getRecentAlerts(limit = 5) {
  if (USE_MOCKS) return mockDelay(mockAlerts.slice(0, limit));
  return apiClient.get(`/notifications?sort=-timestamp&limit=${limit}`);
}

export const notificationService = { getRecentAlerts };
