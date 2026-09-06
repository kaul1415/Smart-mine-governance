import { apiClient, USE_MOCKS, mockDelay } from './api.js';
import { mockFlags, mockFlagsByCategory } from '../data/mockData.js';

async function getFlags() {
  if (USE_MOCKS) return mockDelay(mockFlags);
  return apiClient.get('/flags'); // GET /flags
}

async function getRecentFlags(limit = 5) {
  if (USE_MOCKS) {
    const sorted = [...mockFlags].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return mockDelay(sorted.slice(0, limit));
  }
  return apiClient.get(`/flags?sort=-createdAt&limit=${limit}`);
}

async function getFlagsByCategory() {
  if (USE_MOCKS) return mockDelay(mockFlagsByCategory);
  return apiClient.get('/flags/stats/by-category');
}

async function getFlagById(id) {
  if (USE_MOCKS) return mockDelay(mockFlags.find((f) => f.id === id) ?? null);
  return apiClient.get(`/flags/${id}`); // GET /flags/:id
}

export const flagService = { getFlags, getRecentFlags, getFlagsByCategory, getFlagById };
