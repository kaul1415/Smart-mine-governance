import {
  LayoutDashboard,
  Flag,
  MessageSquareReply,
  History,
  Mountain,
  Map,
  ShieldCheck,
  ClipboardCheck,
  Wrench,
  Users,
  Gauge,
  FileText,
  BarChart3,
  Bot,
  Bell,
  Settings,
  FolderKanban,
  ClipboardList,
  CalendarCheck,
  HardHat,
  AlertTriangle,
  TrendingUp,
  Radio,
} from 'lucide-react';
import { ROLES } from './roles.js';

// `roles: null` means "visible to every authenticated role".
// Each item's `roles` list is a UI-only filter — see roles.js.
export const NAV_SECTIONS = [
  {
    items: [{ label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: null }],
  },
  {
    title: 'Governance',
    items: [
      { label: 'Flags', path: '/flags', icon: Flag, roles: null },
      { label: 'Responses', path: '/responses', icon: MessageSquareReply, roles: null },
      {
        label: 'Audit Trail',
        path: '/audit-logs',
        icon: History,
        roles: [ROLES.CORPORATE_ADMIN, ROLES.MINE_MANAGER, ROLES.REGULATOR],
      },
    ],
  },
  {
    title: 'Mines',
    items: [
      {
        label: 'All Mines',
        path: '/mines',
        icon: Mountain,
        roles: [ROLES.CORPORATE_ADMIN, ROLES.MINE_MANAGER, ROLES.SAFETY_OFFICER, ROLES.REGULATOR],
      },
      {
        label: 'Risk Map',
        path: '/risk/map',
        icon: Map,
        roles: [ROLES.CORPORATE_ADMIN, ROLES.MINE_MANAGER, ROLES.SAFETY_OFFICER, ROLES.REGULATOR],
      },
    ],
  },
  {
    items: [
      { label: 'Compliance', path: '/compliance', icon: ShieldCheck, roles: null },
      {
        label: 'Inspections',
        path: '/inspections',
        icon: ClipboardCheck,
        roles: [ROLES.CORPORATE_ADMIN, ROLES.MINE_MANAGER, ROLES.SAFETY_OFFICER, ROLES.FIELD_INSPECTOR, ROLES.REGULATOR],
      },
      {
        label: 'Field Reporting',
        path: '/field',
        icon: Radio,
        roles: [ROLES.CORPORATE_ADMIN, ROLES.MINE_MANAGER, ROLES.SAFETY_OFFICER, ROLES.FIELD_INSPECTOR],
      },
      { label: 'Corrective Actions', path: '/corrective-actions', icon: Wrench, roles: null },
      {
        label: 'Contractors',
        path: '/contractors',
        icon: Users,
        roles: [ROLES.CORPORATE_ADMIN, ROLES.MINE_MANAGER, ROLES.SAFETY_OFFICER, ROLES.REGULATOR],
      },
      {
        label: 'Risk Intelligence',
        path: '/risk',
        icon: Gauge,
        roles: [ROLES.CORPORATE_ADMIN, ROLES.MINE_MANAGER, ROLES.SAFETY_OFFICER, ROLES.REGULATOR],
      },
      { label: 'Documents', path: '/documents', icon: FileText, roles: null },
      {
        label: 'Reports',
        path: '/reports',
        icon: BarChart3,
        roles: [ROLES.CORPORATE_ADMIN, ROLES.MINE_MANAGER, ROLES.SAFETY_OFFICER, ROLES.REGULATOR],
      },
      { label: 'AI Copilot', path: '/copilot', icon: Bot, roles: null },
    ],
  },
  {
    items: [
      { label: 'Notifications', path: '/notifications', icon: Bell, roles: null },
      { label: 'Settings', path: '/settings', icon: Settings, roles: null },
    ],
  },
];

// A Contractor logs into a self-service portal, not the governance
// shell above — an entirely separate nav, per the project brief.
export const CONTRACTOR_NAV_SECTIONS = [
  {
    items: [
      { label: 'My Dashboard', path: '/contractor/dashboard', icon: LayoutDashboard },
      { label: 'My Projects', path: '/contractor/projects', icon: FolderKanban },
      { label: 'My Reports', path: '/contractor/reports', icon: ClipboardList },
      { label: 'Attendance', path: '/contractor/attendance', icon: CalendarCheck },
      { label: 'Safety Requirements', path: '/contractor/safety', icon: HardHat },
      { label: 'Assigned Corrective Actions', path: '/contractor/actions', icon: Wrench },
      { label: 'Documents', path: '/contractor/documents', icon: FileText },
      { label: 'Risk Notifications', path: '/contractor/risk', icon: AlertTriangle },
      { label: 'Performance', path: '/contractor/performance', icon: TrendingUp },
    ],
  },
  {
    items: [
      { label: 'AI Copilot', path: '/copilot', icon: Bot },
      { label: 'Notifications', path: '/notifications', icon: Bell },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

export function navForRole(role) {
  if (role === ROLES.CONTRACTOR) return CONTRACTOR_NAV_SECTIONS;

  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.roles || item.roles.includes(role)),
  })).filter((section) => section.items.length > 0);
}
