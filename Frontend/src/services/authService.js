import { apiClient, USE_MOCKS, mockDelay } from './api.js';
import { mockUsers } from '../data/mockData.js';

const TOKEN_KEY = 'minegov_auth_token';
const USER_KEY = 'minegov_auth_user';

// `department` is accepted alongside `role` so the login flow — and
// the backend contract behind it — is ready for department-based
// authorization: POST /auth/login { email, password, role, department }.
// A department passed at login overrides the mock user's default,
// which is what lets a demo login prove out the System Department
// admin-access override for any role.
async function login({ email, role, department }) {
  if (USE_MOCKS) {
    const user = mockUsers.find((u) => u.role === role) || {
      id: 'guest',
      name: email.split('@')[0],
      email,
      role,
      department,
    };
    const session = {
      user: { ...user, email: email || user.email, department: department || user.department },
      token: `mock-token-${user.id}`,
    };
    return mockDelay(session, 450);
  }

  // Real backend contract: POST /auth/login { email, password, role, department }
  return apiClient.post('/auth/login', { email, role, department });
}

function persistSession(session) {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

function readPersistedUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export const authService = {
  login,
  persistSession,
  readPersistedUser,
  clearSession,
};
