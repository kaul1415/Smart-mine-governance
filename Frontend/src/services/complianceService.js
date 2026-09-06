import { apiClient, USE_MOCKS, mockDelay } from './api.js';
import { mockComplianceRequirements } from '../data/mockData.js';

async function getComplianceRequirements() {
  if (USE_MOCKS) return mockDelay(mockComplianceRequirements);
  return apiClient.get('/compliance'); // GET /compliance
}

async function getComplianceRequirementById(id) {
  if (USE_MOCKS) return mockDelay(mockComplianceRequirements.find((c) => c.id === id) ?? null);
  return apiClient.get(`/compliance/${id}`); // GET /compliance/:id
}

async function getComplianceForMine(mineId) {
  if (USE_MOCKS) return mockDelay(mockComplianceRequirements.filter((c) => c.mineId === mineId));
  return apiClient.get(`/compliance?mineId=${mineId}`);
}

export const complianceService = { getComplianceRequirements, getComplianceRequirementById, getComplianceForMine };
