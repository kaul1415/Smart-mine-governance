import { apiClient, USE_MOCKS, mockDelay } from './api.js';
import { mockDashboardStats } from '../data/mockData.js';

export async function getDashboardStats() {
  if (USE_MOCKS) return mockDelay(mockDashboardStats);
  try {
    return await apiClient.get('/dashboard');
  } catch {
    return mockDashboardStats;
  }
}

export const dashboardService = { getDashboardStats };
