import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import Login from './pages/auth/Login.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import FlagsList from './pages/flags/FlagsList.jsx';
import NewFlag from './pages/flags/NewFlag.jsx';
import FlagDetails from './pages/flags/FlagDetails.jsx';
import ResponsesList from './pages/responses/ResponsesList.jsx';
import ResponseDetails from './pages/responses/ResponseDetails.jsx';
import AuditTrail from './pages/audit/AuditTrail.jsx';
import MinesList from './pages/mines/MinesList.jsx';
import MineDetails from './pages/mines/MineDetails.jsx';
import ComplianceList from './pages/compliance/ComplianceList.jsx';
import ComplianceDetails from './pages/compliance/ComplianceDetails.jsx';
import InspectionsList from './pages/inspections/InspectionsList.jsx';
import NewInspection from './pages/inspections/NewInspection.jsx';
import InspectionDetails from './pages/inspections/InspectionDetails.jsx';
import CorrectiveActionsList from './pages/correctiveActions/CorrectiveActionsList.jsx';
import CorrectiveActionDetails from './pages/correctiveActions/CorrectiveActionDetails.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import NotFound from './pages/NotFound.jsx';

// Routes scoped to later phases render a PlaceholderPage for now so
// navigation and layout can be demoed end-to-end without waiting for
// every module. Each entry maps 1:1 to the route list in the project
// brief and gets swapped for the real page as its phase is built.
const PLACEHOLDER_ROUTES = [
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

        <Route path="/flags" element={<FlagsList />} />
        <Route path="/flags/new" element={<NewFlag />} />
        <Route path="/flags/:id" element={<FlagDetails />} />
        <Route path="/responses" element={<ResponsesList />} />
        <Route path="/responses/:id" element={<ResponseDetails />} />
        <Route path="/audit-logs" element={<AuditTrail />} />

        <Route path="/mines" element={<MinesList />} />
        <Route path="/mines/:id" element={<MineDetails />} />
        <Route path="/compliance" element={<ComplianceList />} />
        <Route path="/compliance/:id" element={<ComplianceDetails />} />
        <Route path="/inspections" element={<InspectionsList />} />
        <Route path="/inspections/new" element={<NewInspection />} />
        <Route path="/inspections/:id" element={<InspectionDetails />} />
        <Route path="/corrective-actions" element={<CorrectiveActionsList />} />
        <Route path="/corrective-actions/:id" element={<CorrectiveActionDetails />} />

        {PLACEHOLDER_ROUTES.map(({ path, title, phase }) => (
          <Route key={path} path={path} element={<PlaceholderPage title={title} phase={phase} />} />
        ))}
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
