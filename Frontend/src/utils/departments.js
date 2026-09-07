// Department is a second, independent access dimension alongside
// Role. The production backend will authorize primarily by
// department (with role shaping what a UI shows within it); this
// frontend keeps both on the user object now so nothing has to be
// restructured when that lands. System Department is special: it
// carries admin-level access regardless of the user's role, mirroring
// how the backend will treat it.

export const DEPARTMENTS = {
  SYSTEM: 'system',
  SAFETY: 'safety',
  ENVIRONMENT: 'environment',
  OPERATIONS: 'operations',
  HR_LABOUR: 'hr_labour',
  CONTRACTOR_MANAGEMENT: 'contractor_management',
  REGULATORY_AFFAIRS: 'regulatory_affairs',
};

export const DEPARTMENT_LABELS = {
  [DEPARTMENTS.SYSTEM]: 'System',
  [DEPARTMENTS.SAFETY]: 'Safety',
  [DEPARTMENTS.ENVIRONMENT]: 'Environment',
  [DEPARTMENTS.OPERATIONS]: 'Operations',
  [DEPARTMENTS.HR_LABOUR]: 'HR & Labour',
  [DEPARTMENTS.CONTRACTOR_MANAGEMENT]: 'Contractor Management',
  [DEPARTMENTS.REGULATORY_AFFAIRS]: 'Regulatory Affairs',
};

export function departmentLabel(department) {
  return DEPARTMENT_LABELS[department] ?? department;
}

// UI-only convenience — same caveat as roles.js: the backend remains
// the authority on what System Department members can actually do.
export function isSystemDepartment(department) {
  return department === DEPARTMENTS.SYSTEM;
}
