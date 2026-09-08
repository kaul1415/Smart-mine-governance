import { apiClient, USE_MOCKS, mockDelay } from './api.js';
import { mockUsers } from '../data/mockData.js';
import { ROLES } from '../utils/roles.js';
import { departmentLabel } from '../utils/departments.js';
import { roleForDepartment } from '../utils/departmentConfig.js';

const TOKEN_KEY = 'minegov_auth_token';
const USER_KEY = 'minegov_auth_user';

// Three login paths share this one function:
//  - loginType "department": department is required; role is derived
//    from it via roleForDepartment() (department → role → permissions).
//  - loginType "contractor" / "regulator": no department (external
//    parties, not one of the internal departments); role is fixed.
//
// Real backend contract: POST /auth/login { username, password, loginType, department? }
// The backend should return { user: { id, name, email, role, department?, contractorId? }, token }.
async function login({ username, password, loginType, department }) {
  if (USE_MOCKS) {
    let user;

    if (loginType === 'contractor') {
      user = mockUsers.find((u) => u.role === ROLES.CONTRACTOR);
    } else if (loginType === 'regulator') {
      user = mockUsers.find((u) => u.role === ROLES.REGULATOR);
    } else {
      // Department login: prefer a seeded mock user for that
      // department (so the demo has real linked data), otherwise
      // synthesize a generic officer for that department so every
      // one of the 15 departments + System is actually usable.
      const seeded = mockUsers.find((u) => u.department === department);
      user = seeded || {
        id: `dept-${department}`,
        name: username ? `${username} (${departmentLabel(department)})` : `${departmentLabel(department)} Officer`,
        email: `${username || 'officer'}@minegov.ai`,
        role: roleForDepartment(department),
        department,
      };
    }

    const session = {
      user: { ...user, department: loginType === 'department' ? department : user.department },
      token: `mock-token-${user.id}`,
    };
    return mockDelay(session, 450);
  }

  return apiClient.post('/auth/login', { username, password, loginType, department });
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
