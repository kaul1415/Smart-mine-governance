// Base API client.
//
// This is the ONLY module that should know about the network layer.
// Every feature service (flagService, mineService, ...) is built on
// top of `apiClient`, and every page/component talks to a feature
// service — never to fetch()/axios or an endpoint string directly.
//
// Today, USE_MOCKS is true and feature services resolve from
// src/data/mockData.js. Flipping USE_MOCKS to false (or unsetting it
// via env) switches every service to real HTTP calls through
// apiClient without touching a single page component.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Toggle for the whole app. In a later phase this can move to an
// env var (VITE_USE_MOCKS) once the backend contract is stable.
export const USE_MOCKS = true;

// Simulates realistic network latency for mock responses so loading
// states are actually visible during the SIH demo instead of
// flashing instantly.
export function mockDelay(data, ms = 350) {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, { method = 'GET', body, headers, signal } = {}) {
  const token = localStorage.getItem('minegov_auth_token');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new ApiError(payload?.message || response.statusText, response.status, payload);
  }

  return payload;
}

export const apiClient = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

export { ApiError };
