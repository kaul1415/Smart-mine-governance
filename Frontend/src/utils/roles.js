// Central role definitions.
// IMPORTANT: these constants drive UI/UX only (what's shown, what's
// enabled). They are NOT a security boundary — the backend is the
// authority on what any given user is actually permitted to do.

import { isSystemDepartment } from './departments.js';

export const ROLES = {
  CORPORATE_ADMIN: 'corporate_admin',
  MINE_MANAGER: 'mine_manager',
  SAFETY_OFFICER: 'safety_officer',
  FIELD_INSPECTOR: 'field_inspector',
  CONTRACTOR: 'contractor',
  REGULATOR: 'regulator',
  // Generic baseline role for departments that don't map to one of
  // the specialized roles above (e.g. Material Management, ERP,
  // Company Secretary, HRD, ...). See utils/departmentConfig.js for
  // the department → role mapping this comes from.
  DEPARTMENT_OFFICER: 'department_officer',
};

export const ROLE_LABELS = {
  [ROLES.CORPORATE_ADMIN]: 'Corporate Admin',
  [ROLES.MINE_MANAGER]: 'Mine Manager',
  [ROLES.SAFETY_OFFICER]: 'Safety / Compliance Officer',
  [ROLES.FIELD_INSPECTOR]: 'Field Inspector',
  [ROLES.CONTRACTOR]: 'Contractor',
  [ROLES.REGULATOR]: 'Regulator',
  [ROLES.DEPARTMENT_OFFICER]: 'Department Officer',
};

// Roles that land on the standalone Contractor Portal shell rather
// than the main governance dashboard shell after login.
export const CONTRACTOR_PORTAL_ROLES = [ROLES.CONTRACTOR];

export function roleLabel(role) {
  return ROLE_LABELS[role] ?? role;
}

// Admin-level access, independent of role: either the Corporate Admin
// role, OR membership in the System Department. This mirrors how the
// production backend will treat System Department once department-
// based authorization lands — a System Department member gets
// admin-level access even if their role tag is something else.
// UI-only gate — see the note at the top of this file.
export function hasAdminAccess(user) {
  if (!user) return false;
  return user.role === ROLES.CORPORATE_ADMIN || isSystemDepartment(user.department);
}

// Roles that see the reporter identity behind a flag instead of
// "Anonymous / Confidential". Purely a UI affordance — the backend
// decides what identity data is actually returned. Accepts the full
// user object (not just role) so a System Department member always
// qualifies, regardless of role.
export const ROLES_THAT_SEE_REPORTER_IDENTITY = [ROLES.CORPORATE_ADMIN, ROLES.SAFETY_OFFICER, ROLES.REGULATOR];

export function canSeeReporterIdentity(user) {
  if (hasAdminAccess(user)) return true;
  return ROLES_THAT_SEE_REPORTER_IDENTITY.includes(user?.role);
}

// Roles that may submit an official regulatory response to a flag.
// UI-only gate — see the note at the top of this file. Also accepts
// the full user object for the same System Department override.
export const ROLES_THAT_CAN_RESPOND = [ROLES.CORPORATE_ADMIN, ROLES.MINE_MANAGER, ROLES.SAFETY_OFFICER, ROLES.REGULATOR];

export function canSubmitResponse(user) {
  if (hasAdminAccess(user)) return true;
  return ROLES_THAT_CAN_RESPOND.includes(user?.role);
}
