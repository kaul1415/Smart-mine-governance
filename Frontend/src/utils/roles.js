// Central role definitions.
// IMPORTANT: these constants drive UI/UX only (what's shown, what's
// enabled). They are NOT a security boundary — the backend is the
// authority on what any given user is actually permitted to do.

export const ROLES = {
  CORPORATE_ADMIN: 'corporate_admin',
  MINE_MANAGER: 'mine_manager',
  SAFETY_OFFICER: 'safety_officer',
  FIELD_INSPECTOR: 'field_inspector',
  CONTRACTOR: 'contractor',
  REGULATOR: 'regulator',
};

export const ROLE_LABELS = {
  [ROLES.CORPORATE_ADMIN]: 'Corporate Admin',
  [ROLES.MINE_MANAGER]: 'Mine Manager',
  [ROLES.SAFETY_OFFICER]: 'Safety / Compliance Officer',
  [ROLES.FIELD_INSPECTOR]: 'Field Inspector',
  [ROLES.CONTRACTOR]: 'Contractor',
  [ROLES.REGULATOR]: 'Regulator',
};

// Roles that see the reporter identity behind a flag instead of
// "Anonymous / Confidential". Purely a UI affordance — the backend
// decides what identity data is actually returned.
export const ROLES_THAT_SEE_REPORTER_IDENTITY = [
  ROLES.CORPORATE_ADMIN,
  ROLES.SAFETY_OFFICER,
  ROLES.REGULATOR,
];

// Roles that land on the standalone Contractor Portal shell rather
// than the main governance dashboard shell after login.
export const CONTRACTOR_PORTAL_ROLES = [ROLES.CONTRACTOR];

export function roleLabel(role) {
  return ROLE_LABELS[role] ?? role;
}

export function canSeeReporterIdentity(role) {
  return ROLES_THAT_SEE_REPORTER_IDENTITY.includes(role);
}

// Roles that may submit an official regulatory response to a flag.
// UI-only gate — see the note at the top of this file.
export const ROLES_THAT_CAN_RESPOND = [
  ROLES.CORPORATE_ADMIN,
  ROLES.MINE_MANAGER,
  ROLES.SAFETY_OFFICER,
  ROLES.REGULATOR,
];

export function canSubmitResponse(role) {
  return ROLES_THAT_CAN_RESPOND.includes(role);
}
