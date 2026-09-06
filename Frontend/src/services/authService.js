import { apiClient, USE_MOCKS, mockDelay } from './api.js';
import { mockUsers } from '../data/mockData.js';

const TOKEN_KEY = 'minegov_auth_token';
const USER_KEY = 'minegov_auth_user';

async function login({ email, role }) {
  if (USE_MOCKS) {
    const user = mockUsers.find((u) => u.role === role) || {
      id: 'guest',
      name: email.split('@')[0],
      email,
      role,
    };
    const session = { user: { ...user, email: email || user.email }, token: `mock-token-${user.id}` };
    return mockDelay(session, 450);
  }

  // Real backend contract: POST /auth/login { email, password, role }
  return apiClient.post('/auth/login', { email, role });
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
