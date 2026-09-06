import { apiClient, USE_MOCKS, mockDelay } from './api.js';
import { mockRiskScores } from '../data/mockData.js';

// NOTE: risk scores are always computed by the backend/AI service.
// This layer only ever fetches and returns what the server sends —
// no scoring logic belongs in the frontend.

async function getRiskScores() {
  if (USE_MOCKS) return mockDelay(mockRiskScores);
  return apiClient.get('/risk'); // GET /risk
}

async function getRiskForMine(mineId) {
  if (USE_MOCKS) return mockDelay(mockRiskScores.find((r) => r.mineId === mineId) ?? null);
  return apiClient.get(`/risk/mines/${mineId}`); // GET /risk/mines/:id
}

export const riskService = { getRiskScores, getRiskForMine };
