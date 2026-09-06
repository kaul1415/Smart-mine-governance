// SYNTHETIC PROTOTYPE DATA — for SIH demo purposes only.
// None of the below represents a real mine, worker, contractor or
// government record. Shapes here are the contract the frontend
// expects; see BACKEND_API_CONTRACT.md for the real API shape.

import { ROLES } from '../utils/roles.js';

export const mockUsers = [
  { id: 'u1', name: 'Ananya Rao', email: 'admin@minegov.ai', role: ROLES.CORPORATE_ADMIN },
  { id: 'u2', name: 'Vikram Sethi', email: 'manager@minegov.ai', role: ROLES.MINE_MANAGER, mineId: 'mine-b' },
  { id: 'u3', name: 'Priya Nair', email: 'safety@minegov.ai', role: ROLES.SAFETY_OFFICER },
  { id: 'u4', name: 'Arjun Mehta', email: 'inspector@minegov.ai', role: ROLES.FIELD_INSPECTOR },
  { id: 'u5', name: 'ABC Mining Services', email: 'contractor@minegov.ai', role: ROLES.CONTRACTOR },
  { id: 'u6', name: 'Coal Controller Office', email: 'regulator@minegov.ai', role: ROLES.REGULATOR },
];

export const mockMines = [
  {
    id: 'mine-a',
    name: 'Mine A — Talcher Opencast',
    location: 'Angul, Odisha',
    status: 'Operational',
    complianceRate: 91,
    riskScore: 34,
    riskLevel: 'LOW',
    openFlags: 3,
    openCorrectiveActions: 2,
    coordinates: [20.9441, 85.1636],
  },
  {
    id: 'mine-b',
    name: 'Mine B — Jharia Underground',
    location: 'Dhanbad, Jharkhand',
    status: 'Operational',
    complianceRate: 68,
    riskScore: 82,
    riskLevel: 'HIGH',
    openFlags: 9,
    openCorrectiveActions: 5,
    coordinates: [23.7397, 86.4133],
  },
  {
    id: 'mine-c',
    name: 'Mine C — Korba Block',
    location: 'Korba, Chhattisgarh',
    status: 'Operational',
    complianceRate: 84,
    riskScore: 51,
    riskLevel: 'MEDIUM',
    openFlags: 5,
    openCorrectiveActions: 3,
    coordinates: [22.3595, 82.7501],
  },
  {
    id: 'mine-d',
    name: 'Mine D — Singareni Extension',
    location: 'Kothagudem, Telangana',
    status: 'Operational',
    complianceRate: 96,
    riskScore: 18,
    riskLevel: 'LOW',
    openFlags: 1,
    openCorrectiveActions: 0,
    coordinates: [17.5535, 80.6198],
  },
  {
    id: 'mine-e',
    name: 'Mine E — Raniganj Field',
    location: 'Paschim Bardhaman, West Bengal',
    status: 'Under Review',
    complianceRate: 74,
    riskScore: 63,
    riskLevel: 'MEDIUM',
    openFlags: 6,
    openCorrectiveActions: 4,
    coordinates: [23.6167, 87.1333],
  },
];

export const FLAG_CATEGORIES = ['Safety', 'Environment', 'Labour', 'Equipment', 'Administrative', 'Compliance', 'Other'];

export const FLAG_STATUSES = [
  'New',
  'Under Review',
  'Assigned',
  'Investigation',
  'Action Required',
  'Action Taken',
  'Resolved',
  'Dismissed',
  'Closed',
];

export const mockFlags = [
  {
    id: 'F-1021',
    category: 'Safety',
    mineId: 'mine-b',
    mineName: 'Mine B — Jharia Underground',
    location: 'Shaft 3, East Gallery',
    description: 'Fire extinguisher near the east gallery junction is expired and the pressure gauge reads empty.',
    severity: 'HIGH',
    status: 'Action Required',
    createdAt: '2026-09-03T09:12:00+05:30',
    assignedAuthority: 'Priya Nair (Safety Officer)',
    reporterType: 'Field Worker',
    isConfidential: true,
    reporterName: 'Confidential Reporter #4471',
  },
  {
    id: 'F-1020',
    category: 'Environment',
    mineId: 'mine-e',
    mineName: 'Mine E — Raniganj Field',
    location: 'Tailings Pond 2',
    description: 'Visible discoloration and odor observed in runoff near tailings pond 2 after overnight rain.',
    severity: 'MEDIUM',
    status: 'Investigation',
    createdAt: '2026-09-02T18:40:00+05:30',
    assignedAuthority: 'Environment Cell',
    reporterType: 'Field Inspector',
    isConfidential: false,
    reporterName: 'Arjun Mehta',
  },
  {
    id: 'F-1019',
    category: 'Labour',
    mineId: 'mine-c',
    mineName: 'Mine C — Korba Block',
    location: 'Contractor Camp 1',
    description: 'Overtime hours for night-shift contract workers exceed the posted statutory limit.',
    severity: 'MEDIUM',
    status: 'Resolved',
    createdAt: '2026-08-29T11:05:00+05:30',
    assignedAuthority: 'HR Compliance',
    reporterType: 'Contractor Staff',
    isConfidential: true,
    reporterName: 'Confidential Reporter #3390',
  },
  {
    id: 'F-1018',
    category: 'Equipment',
    mineId: 'mine-b',
    mineName: 'Mine B — Jharia Underground',
    location: 'Conveyor Belt 4',
    description: 'Conveyor belt 4 guard rail is missing a section near the drive motor.',
    severity: 'HIGH',
    status: 'Assigned',
    createdAt: '2026-08-27T07:52:00+05:30',
    assignedAuthority: 'Vikram Sethi (Mine Manager)',
    reporterType: 'Field Worker',
    isConfidential: true,
    reporterName: 'Confidential Reporter #2214',
  },
  {
    id: 'F-1017',
    category: 'Compliance',
    mineId: 'mine-a',
    mineName: 'Mine A — Talcher Opencast',
    location: 'Site Office',
    description: 'Statutory display board for emergency contacts has not been updated after office relocation.',
    severity: 'LOW',
    status: 'Closed',
    createdAt: '2026-08-20T10:00:00+05:30',
    assignedAuthority: 'Site Administration',
    reporterType: 'Regulator',
    isConfidential: false,
    reporterName: 'Coal Controller Office',
  },
];

export const mockResponses = [
  {
    id: 'R-501',
    flagId: 'F-1021',
    authority: 'Priya Nair (Safety Officer)',
    responseType: 'Action Initiated',
    status: 'Open',
    date: '2026-09-03T13:30:00+05:30',
    officialResponse: 'Inspection initiated for east gallery fire safety equipment.',
  },
  {
    id: 'R-500',
    flagId: 'F-1018',
    authority: 'Vikram Sethi (Mine Manager)',
    responseType: 'Issue Approved',
    status: 'Open',
    date: '2026-08-27T09:20:00+05:30',
    officialResponse: 'Confirmed missing guard rail section; contractor notified for replacement.',
  },
];

export const mockCorrectiveActions = [
  {
    id: 'CA-1042',
    flagId: 'F-1021',
    issue: 'Expired fire extinguisher, east gallery',
    mineId: 'mine-b',
    mineName: 'Mine B — Jharia Underground',
    assignedTo: 'ABC Mining Services',
    priority: 'HIGH',
    dueDate: '2026-09-04T18:00:00+05:30',
    status: 'Open',
    isOverdue: true,
  },
  {
    id: 'CA-1041',
    flagId: 'F-1018',
    issue: 'Missing guard rail, Conveyor Belt 4',
    mineId: 'mine-b',
    mineName: 'Mine B — Jharia Underground',
    assignedTo: 'ABC Mining Services',
    priority: 'HIGH',
    dueDate: '2026-09-06T18:00:00+05:30',
    status: 'In Progress',
    isOverdue: false,
  },
  {
    id: 'CA-1039',
    flagId: 'F-1020',
    issue: 'Tailings pond runoff investigation',
    mineId: 'mine-e',
    mineName: 'Mine E — Raniganj Field',
    assignedTo: 'Site Environment Cell',
    priority: 'MEDIUM',
    dueDate: '2026-09-10T18:00:00+05:30',
    status: 'Assigned',
    isOverdue: false,
  },
];

export const mockRiskScores = [
  {
    mineId: 'mine-b',
    mineName: 'Mine B — Jharia Underground',
    score: 82,
    previousScore: 74,
    level: 'HIGH',
    trend: 'up',
    contributors: [
      { label: 'Overdue Corrective Actions', weight: 32 },
      { label: 'Safety Violations', weight: 27 },
      { label: 'Contractor Risk', weight: 21 },
      { label: 'Inspection Findings', weight: 20 },
    ],
  },
  {
    mineId: 'mine-e',
    mineName: 'Mine E — Raniganj Field',
    score: 63,
    previousScore: 58,
    level: 'MEDIUM',
    trend: 'up',
    contributors: [
      { label: 'Environmental Risk', weight: 30 },
      { label: 'Inspection Findings', weight: 22 },
      { label: 'Operational Anomalies', weight: 11 },
    ],
  },
  {
    mineId: 'mine-c',
    mineName: 'Mine C — Korba Block',
    score: 51,
    previousScore: 55,
    level: 'MEDIUM',
    trend: 'down',
    contributors: [
      { label: 'Contractor Risk', weight: 24 },
      { label: 'Safety Violations', weight: 16 },
    ],
  },
];

export const mockComplianceTrend = [
  { month: 'Apr', rate: 79 },
  { month: 'May', rate: 81 },
  { month: 'Jun', rate: 80 },
  { month: 'Jul', rate: 83 },
  { month: 'Aug', rate: 82 },
  { month: 'Sep', rate: 85 },
];

export const mockFlagsByCategory = [
  { category: 'Safety', count: 52 },
  { category: 'Environment', count: 31 },
  { category: 'Labour', count: 24 },
  { category: 'Equipment', count: 18 },
  { category: 'Administrative', count: 12 },
  { category: 'Compliance', count: 9 },
];

export const mockAlerts = [
  {
    id: 'AL-1',
    type: 'HIGH RISK',
    message: 'Mine B risk score increased from 74 to 82.',
    timestamp: '2026-09-05T08:15:00+05:30',
  },
  {
    id: 'AL-2',
    type: 'OVERDUE',
    message: 'Corrective Action CA-1042 is overdue.',
    timestamp: '2026-09-05T06:00:00+05:30',
  },
  {
    id: 'AL-3',
    type: 'FLAG',
    message: 'New high-severity safety flag F-1021 received from Mine B.',
    timestamp: '2026-09-03T09:12:00+05:30',
  },
  {
    id: 'AL-4',
    type: 'AI ALERT',
    message: 'Recurring PPE non-compliance pattern detected for ABC Mining Services.',
    timestamp: '2026-09-02T17:30:00+05:30',
  },
];

export const mockDashboardStats = {
  totalMines: mockMines.length,
  activeFlags: mockFlags.filter((f) => !['Resolved', 'Dismissed', 'Closed'].includes(f.status)).length,
  highCriticalRiskMines: mockMines.filter((m) => ['HIGH', 'CRITICAL'].includes(m.riskLevel)).length,
  complianceRate: 82,
  openCorrectiveActions: mockCorrectiveActions.filter((a) => a.status !== 'Closed').length,
  overdueActions: mockCorrectiveActions.filter((a) => a.isOverdue).length,
};
