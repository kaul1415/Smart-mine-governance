// Department is the primary access boundary for internal Coal India
// staff, per the finalized authentication model: one common
// "Department Login" screen with a department dropdown, rather than
// a separate login page per department. System Department is the
// admin/system-level department — organization-wide visibility and
// administrative capability, regardless of the user's role tag (see
// hasAdminAccess() in roles.js).
//
// Contractor and Regulator remain separate, non-department login
// paths (see pages/auth/Login.jsx) — they are external parties, not
// one of the internal departments below.

export const DEPARTMENTS = {
  SYSTEM: 'system',
  PRODUCTION: 'production',
  MATERIAL_MANAGEMENT: 'material_management',
  ERP: 'erp',
  ENGINEERING_EQUIPMENT: 'engineering_equipment',
  COMPANY_SECRETARY: 'company_secretary',
  CLEARING_FORWARDING: 'clearing_forwarding',
  ELECTRONICS_TELECOM: 'electronics_telecom',
  HRD: 'hrd',
  APPEAL_GRIEVANCE: 'appeal_grievance',
  CORPORATE_PLANNING: 'corporate_planning',
  PROJECT_MONITORING: 'project_monitoring',
  CONTRACT_MANAGEMENT: 'contract_management',
  SAFETY_RESCUE: 'safety_rescue',
  WELFARE: 'welfare',
};

export const DEPARTMENT_LABELS = {
  [DEPARTMENTS.SYSTEM]: 'System Department',
  [DEPARTMENTS.PRODUCTION]: 'Production',
  [DEPARTMENTS.MATERIAL_MANAGEMENT]: 'Material Management',
  [DEPARTMENTS.ERP]: 'ERP',
  [DEPARTMENTS.ENGINEERING_EQUIPMENT]: 'Engineering & Equipment',
  [DEPARTMENTS.COMPANY_SECRETARY]: 'Company Secretary',
  [DEPARTMENTS.CLEARING_FORWARDING]: 'Clearing & Forwarding',
  [DEPARTMENTS.ELECTRONICS_TELECOM]: 'Electronics & Telecommunication',
  [DEPARTMENTS.HRD]: 'Human Resource Development',
  [DEPARTMENTS.APPEAL_GRIEVANCE]: 'Appeal & Grievance Cell',
  [DEPARTMENTS.CORPORATE_PLANNING]: 'Corporate Planning',
  [DEPARTMENTS.PROJECT_MONITORING]: 'Project Monitoring',
  [DEPARTMENTS.CONTRACT_MANAGEMENT]: 'Contract Management',
  [DEPARTMENTS.SAFETY_RESCUE]: 'Safety & Rescue',
  [DEPARTMENTS.WELFARE]: 'Welfare',
};

// Order the department dropdown should render in — matches the
// finalized department list exactly.
export const DEPARTMENT_ORDER = [
  DEPARTMENTS.SYSTEM,
  DEPARTMENTS.PRODUCTION,
  DEPARTMENTS.MATERIAL_MANAGEMENT,
  DEPARTMENTS.ERP,
  DEPARTMENTS.ENGINEERING_EQUIPMENT,
  DEPARTMENTS.COMPANY_SECRETARY,
  DEPARTMENTS.CLEARING_FORWARDING,
  DEPARTMENTS.ELECTRONICS_TELECOM,
  DEPARTMENTS.HRD,
  DEPARTMENTS.APPEAL_GRIEVANCE,
  DEPARTMENTS.CORPORATE_PLANNING,
  DEPARTMENTS.PROJECT_MONITORING,
  DEPARTMENTS.CONTRACT_MANAGEMENT,
  DEPARTMENTS.SAFETY_RESCUE,
  DEPARTMENTS.WELFARE,
];

export function departmentLabel(department) {
  return DEPARTMENT_LABELS[department] ?? department;
}

// UI-only convenience — same caveat as roles.js: the backend remains
// the authority on what System Department members can actually do.
export function isSystemDepartment(department) {
  return department === DEPARTMENTS.SYSTEM;
}
