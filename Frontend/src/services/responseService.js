import { apiClient, USE_MOCKS, mockDelay } from './api.js';
import { mockResponses } from '../data/mockData.js';

// In-memory copy so the mock "submit response" flow can append new
// records for the session without mutating the imported module.
let responses = [...mockResponses];

async function getResponses() {
  if (USE_MOCKS) return mockDelay([...responses].sort((a, b) => new Date(b.date) - new Date(a.date)));
  return apiClient.get('/responses'); // GET /responses
}

async function getResponseById(id) {
  if (USE_MOCKS) return mockDelay(responses.find((r) => r.id === id) ?? null);
  return apiClient.get(`/responses/${id}`); // GET /responses/:id
}

async function getResponsesForFlag(flagId) {
  if (USE_MOCKS) return mockDelay(responses.filter((r) => r.flagId === flagId));
  return apiClient.get(`/responses?flagId=${flagId}`);
}

async function submitResponse(payload) {
  if (USE_MOCKS) {
    const newResponse = {
      id: `R-${500 + responses.length + 1}`,
      status: 'Open',
      date: new Date().toISOString(),
      supportingDocuments: [],
      ...payload,
    };
    responses = [newResponse, ...responses];
    return mockDelay(newResponse, 500);
  }
  return apiClient.post('/responses', payload); // POST /responses
}

export const responseService = { getResponses, getResponseById, getResponsesForFlag, submitResponse };
