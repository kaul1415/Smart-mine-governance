import { apiClient, USE_MOCKS, mockDelay } from './api.js';
import { mockMines } from '../data/mockData.js';

async function getMines() {
  if (USE_MOCKS) return mockDelay(mockMines);
  return apiClient.get('/mines'); // GET /mines
}

async function getMineById(id) {
  if (USE_MOCKS) return mockDelay(mockMines.find((m) => m.id === id) ?? null);
  return apiClient.get(`/mines/${id}`); // GET /mines/:id
}

async function getHighRiskMines() {
  if (USE_MOCKS) return mockDelay(mockMines.filter((m) => ['HIGH', 'CRITICAL'].includes(m.riskLevel)));
  return apiClient.get('/mines?riskLevel=HIGH,CRITICAL');
}

export const mineService = { getMines, getMineById, getHighRiskMines };
