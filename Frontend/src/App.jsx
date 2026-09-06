import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import Login from './pages/auth/Login.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import NotFound from './pages/NotFound.jsx';

// Routes scoped to later phases render a PlaceholderPage for now so
// navigation and layout can be demoed end-to-end without waiting for
// every module. Each entry maps 1:1 to the route list in the project
// brief and gets swapped for the real page as its phase is built.
const PLACEHOLDER_ROUTES = [
  { path: '/flags', title: 'Flags', phase: 'Phase 2' },
  { path: '/flags/new', title: 'New Flag', phase: 'Phase 2' },
  { path: '/flags/:id', title: 'Flag Details', phase: 'Phase 2' },
  { path: '/responses', title: 'Regulatory Responses', phase: 'Phase 2' },
  { path: '/responses/:id', title: 'Response Details', phase: 'Phase 2' },
  { path: '/audit-logs', title: 'Audit Trail', phase: 'Phase 2' },
  { path: '/mines', title: 'Mines', phase: 'Phase 3' },
  { path: '/mines/:id', title: 'Mine Details', phase: 'Phase 3' },
  { path: '/compliance', title: 'Compliance', phase: 'Phase 3' },
  { path: '/compliance/:id', title: 'Compliance Requirement', phase: 'Phase 3' },
  { path: '/inspections', title: 'Inspections', phase: 'Phase 3' },
  { path: '/inspections/new', title: 'New Inspection', phase: 'Phase 3' },
  { path: '/inspections/:id', title: 'Inspection Details', phase: 'Phase 3' },
  { path: '/corrective-actions', title: 'Corrective Actions', phase: 'Phase 3' },
  { path: '/corrective-actions/:id', title: 'Corrective Action Details', phase: 'Phase 3' },
  { path: '/risk', title: 'Risk Intelligence', phase: 'Phase 4' },
  { path: '/risk/map', title: 'Risk Map', phase: 'Phase 4' },
  { path: '/notifications', title: 'Notifications', phase: 'Phase 4' },
  { path: '/contractors', title: 'Contractors', phase: 'Phase 5' },
  { path: '/contractors/:id', title: 'Contractor Details', phase: 'Phase 5' },
  { path: '/contractor/dashboard', title: 'Contractor Dashboard', phase: 'Phase 5' },
  { path: '/contractor/projects', title: 'My Projects', phase: 'Phase 5' },
  { path: '/contractor/reports', title: 'My Reports', phase: 'Phase 5' },
  { path: '/contractor/attendance', title: 'Attendance', phase: 'Phase 5' },
  { path: '/contractor/safety', title: 'Safety Requirements', phase: 'Phase 5' },
  { path: '/contractor/actions', title: 'Assigned Corrective Actions', phase: 'Phase 5' },
  { path: '/contractor/documents', title: 'Contractor Documents', phase: 'Phase 5' },
  { path: '/contractor/risk', title: 'Risk Notifications', phase: 'Phase 5' },
  { path: '/contractor/performance', title: 'Contractor Performance', phase: 'Phase 5' },
  { path: '/documents', title: 'Document Intelligence', phase: 'Phase 6' },
  { path: '/copilot', title: 'AI Copilot', phase: 'Phase 6' },
  { path: '/reports', title: 'Reports', phase: 'Phase 6' },
  { path: '/settings', title: 'Settings', phase: 'Phase 8' },
];

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        {PLACEHOLDER_ROUTES.map(({ path, title, phase }) => (
          <Route key={path} path={path} element={<PlaceholderPage title={title} phase={phase} />} />
        ))}
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
