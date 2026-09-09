import { ROLES, hasAdminAccess } from './roles.js';

// UI-only workflow map. Buttons shown here reflect what a role would
// typically do next; the backend remains the source of truth for
// whether a transition is actually permitted.
const TRANSITIONS = {
  Open: [{ label: 'Assign', nextStatus: 'Assigned', roles: [ROLES.CORPORATE_ADMIN, ROLES.MINE_MANAGER, ROLES.SAFETY_OFFICER] }],
  Assigned: [{ label: 'Start', nextStatus: 'In Progress', roles: [ROLES.CONTRACTOR, ROLES.FIELD_INSPECTOR, ROLES.MINE_MANAGER] }],
  'In Progress': [
    { label: 'Submit for Verification', nextStatus: 'Submitted for Verification', roles: [ROLES.CONTRACTOR, ROLES.FIELD_INSPECTOR] },
  ],
  'Submitted for Verification': [
    { label: 'Approve', nextStatus: 'Verified', roles: [ROLES.CORPORATE_ADMIN, ROLES.MINE_MANAGER, ROLES.SAFETY_OFFICER, ROLES.REGULATOR] },
    { label: 'Reject', nextStatus: 'Rejected', roles: [ROLES.CORPORATE_ADMIN, ROLES.MINE_MANAGER, ROLES.SAFETY_OFFICER, ROLES.REGULATOR] },
  ],
  Verified: [{ label: 'Close', nextStatus: 'Closed', roles: [ROLES.CORPORATE_ADMIN, ROLES.MINE_MANAGER] }],
  Rejected: [{ label: 'Reassign', nextStatus: 'Assigned', roles: [ROLES.CORPORATE_ADMIN, ROLES.MINE_MANAGER, ROLES.SAFETY_OFFICER] }],
  Closed: [],
};

// Accepts the full user object: a System Department member sees
// every transition for the current status, mirroring the admin-level
// access they'll have once the backend enforces departments.
export function actionsForCorrectiveAction(status, user) {
  const all = TRANSITIONS[status] || [];
  if (hasAdminAccess(user)) return all;
  return all.filter((t) => t.roles.includes(user?.role));
}
