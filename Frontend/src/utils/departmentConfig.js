// Centralizes: department → default role → baseline permissions.
// This is the "department → role → permissions" hierarchy the
// architecture is meant to follow, rather than hardcoding a separate
// dashboard/app per department. The login flow derives a role from
// the selected department using this map; System Department members
// get admin-level access regardless (see hasAdminAccess in roles.js),
// which is enforced independently of this map.
//
// The backend will eventually return `role` and `permissions`
// directly as part of the authenticated user/department record —
// this file is the frontend's stand-in for that until then.

import { ROLES } from './roles.js';
import { DEPARTMENTS } from './departments.js';

// Permission keys are illustrative/UI-facing (used to decide what a
// generic Department Officer can do beyond the baseline "view"
// modules every authenticated user already sees). They are not an
// enforcement mechanism — the backend must independently authorize
// every action.
export const PERMISSIONS = {
  VIEW_ALL_DEPARTMENTS: 'view_all_departments',
  MANAGE_USERS: 'manage_users',
  VIEW_COMPLIANCE: 'view_compliance',
  VIEW_INSPECTIONS: 'view_inspections',
  MANAGE_CORRECTIVE_ACTIONS: 'manage_corrective_actions',
  SUBMIT_RESPONSES: 'submit_responses',
  VIEW_CONTRACTORS: 'view_contractors',
  VIEW_RISK_INTELLIGENCE: 'view_risk_intelligence',
  VIEW_REPORTS: 'view_reports',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  VIEW_ALERTS: 'view_alerts',
  VIEW_NOTICES: 'view_notices',
};

const BASELINE_PERMISSIONS = [PERMISSIONS.VIEW_COMPLIANCE, PERMISSIONS.MANAGE_CORRECTIVE_ACTIONS, PERMISSIONS.VIEW_ALERTS, PERMISSIONS.VIEW_NOTICES];

export const DEPARTMENT_CONFIG = {
  [DEPARTMENTS.SYSTEM]: {
    defaultRole: ROLES.CORPORATE_ADMIN,
    permissions: Object.values(PERMISSIONS), // organization-wide, admin-level
  },
  [DEPARTMENTS.PRODUCTION]: {
    defaultRole: ROLES.MINE_MANAGER,
    permissions: [...BASELINE_PERMISSIONS, PERMISSIONS.VIEW_INSPECTIONS, PERMISSIONS.SUBMIT_RESPONSES, PERMISSIONS.VIEW_CONTRACTORS, PERMISSIONS.VIEW_RISK_INTELLIGENCE, PERMISSIONS.VIEW_REPORTS, PERMISSIONS.VIEW_AUDIT_LOGS],
  },
  [DEPARTMENTS.SAFETY_RESCUE]: {
    defaultRole: ROLES.SAFETY_OFFICER,
    permissions: [...BASELINE_PERMISSIONS, PERMISSIONS.VIEW_INSPECTIONS, PERMISSIONS.SUBMIT_RESPONSES, PERMISSIONS.VIEW_CONTRACTORS, PERMISSIONS.VIEW_RISK_INTELLIGENCE, PERMISSIONS.VIEW_REPORTS],
  },
  [DEPARTMENTS.CONTRACT_MANAGEMENT]: {
    defaultRole: ROLES.DEPARTMENT_OFFICER,
    permissions: [...BASELINE_PERMISSIONS, PERMISSIONS.VIEW_CONTRACTORS, PERMISSIONS.VIEW_REPORTS],
  },
  [DEPARTMENTS.PROJECT_MONITORING]: {
    defaultRole: ROLES.DEPARTMENT_OFFICER,
    permissions: [...BASELINE_PERMISSIONS, PERMISSIONS.VIEW_INSPECTIONS, PERMISSIONS.VIEW_REPORTS],
  },
  [DEPARTMENTS.CORPORATE_PLANNING]: {
    defaultRole: ROLES.DEPARTMENT_OFFICER,
    permissions: [...BASELINE_PERMISSIONS, PERMISSIONS.VIEW_REPORTS, PERMISSIONS.VIEW_RISK_INTELLIGENCE],
  },
  // Remaining departments share the generic Department Officer
  // baseline: view compliance, manage corrective actions in their
  // scope, view alerts and the common notice board. Extend per-row
  // as real permission requirements arrive from the backend team.
  [DEPARTMENTS.MATERIAL_MANAGEMENT]: { defaultRole: ROLES.DEPARTMENT_OFFICER, permissions: BASELINE_PERMISSIONS },
  [DEPARTMENTS.ERP]: { defaultRole: ROLES.DEPARTMENT_OFFICER, permissions: BASELINE_PERMISSIONS },
  [DEPARTMENTS.ENGINEERING_EQUIPMENT]: { defaultRole: ROLES.DEPARTMENT_OFFICER, permissions: BASELINE_PERMISSIONS },
  [DEPARTMENTS.COMPANY_SECRETARY]: { defaultRole: ROLES.DEPARTMENT_OFFICER, permissions: BASELINE_PERMISSIONS },
  [DEPARTMENTS.CLEARING_FORWARDING]: { defaultRole: ROLES.DEPARTMENT_OFFICER, permissions: BASELINE_PERMISSIONS },
  [DEPARTMENTS.ELECTRONICS_TELECOM]: { defaultRole: ROLES.DEPARTMENT_OFFICER, permissions: BASELINE_PERMISSIONS },
  [DEPARTMENTS.HRD]: { defaultRole: ROLES.DEPARTMENT_OFFICER, permissions: BASELINE_PERMISSIONS },
  [DEPARTMENTS.APPEAL_GRIEVANCE]: { defaultRole: ROLES.DEPARTMENT_OFFICER, permissions: BASELINE_PERMISSIONS },
  [DEPARTMENTS.WELFARE]: { defaultRole: ROLES.DEPARTMENT_OFFICER, permissions: BASELINE_PERMISSIONS },
};

export function roleForDepartment(department) {
  return DEPARTMENT_CONFIG[department]?.defaultRole || ROLES.DEPARTMENT_OFFICER;
}

export function permissionsForDepartment(department) {
  return DEPARTMENT_CONFIG[department]?.permissions || BASELINE_PERMISSIONS;
}
