import { apiClient, USE_MOCKS, mockDelay } from './api.js';
import { mockFlags, mockFlagsByCategory } from '../data/mockData.js';

// In-memory copy so the mock "create flag" flow can append new
// records for the session without mutating the imported module.
let flags = [...mockFlags];

async function getFlags() {
  if (USE_MOCKS) return mockDelay([...flags].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  return apiClient.get('/flags'); // GET /flags
}

async function getRecentFlags(limit = 5) {
  if (USE_MOCKS) {
    const sorted = [...flags].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return mockDelay(sorted.slice(0, limit));
  }
  return apiClient.get(`/flags?sort=-createdAt&limit=${limit}`);
}

async function getFlagsByCategory() {
  if (USE_MOCKS) return mockDelay(mockFlagsByCategory);
  return apiClient.get('/flags/stats/by-category');
}

async function getFlagById(id) {
  if (USE_MOCKS) return mockDelay(flags.find((f) => f.id === id) ?? null);
  return apiClient.get(`/flags/${id}`); // GET /flags/:id
}

async function createFlag(payload) {
  if (USE_MOCKS) {
    const newFlag = {
      id: `F-${1021 + flags.length + 1}`,
      status: 'New',
      assignedAuthority: 'Unassigned',
      createdAt: new Date().toISOString(),
      reporterName: payload.isConfidential
        ? `Confidential Reporter #${Math.floor(Math.random() * 9000 + 1000)}`
        : payload.reporterName,
      ...payload,
    };
    flags = [newFlag, ...flags];
    return mockDelay(newFlag, 600);
  }
  return apiClient.post('/flags', payload); // POST /flags
}

async function updateFlag(id, patch) {
  if (USE_MOCKS) {
    flags = flags.map((f) => (f.id === id ? { ...f, ...patch } : f));
    return mockDelay(flags.find((f) => f.id === id), 400);
  }
  return apiClient.patch(`/flags/${id}`, patch); // PATCH /flags/:id
}

export const flagService = { getFlags, getRecentFlags, getFlagsByCategory, getFlagById, createFlag, updateFlag };
