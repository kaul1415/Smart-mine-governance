import { apiClient, USE_MOCKS, mockDelay } from './api.js';
import {
  mockMines,
  mockFlags,
  mockComplianceRequirements,
  mockCorrectiveActions,
  mockContractors,
  mockContractorPerformance,
  mockRiskScores,
} from '../data/mockData.js';

// Mock-only stand-in for a backend report-generation service. Real
// mode simply posts the request and returns whatever the backend
// generates — no aggregation happens in the browser there.
function buildMockReport(reportType, mineId) {
  const mine = mineId ? mockMines.find((m) => m.id === mineId) : null;
  const scopeLabel = mine ? mine.name : 'All Mines';
  const flags = mockFlags.filter((f) => !mineId || f.mineId === mineId);
  const compliance = mockComplianceRequirements.filter((c) => !mineId || c.mineId === mineId);
  const actions = mockCorrectiveActions.filter((a) => !mineId || a.mineId === mineId);
  const risk = mineId ? mockRiskScores.find((r) => r.mineId === mineId) : null;

  const sections = [
    { label: 'Total Flags', value: flags.length },
    { label: 'Open Flags', value: flags.filter((f) => !['Resolved', 'Dismissed', 'Closed'].includes(f.status)).length },
    { label: 'Compliance Requirements Tracked', value: compliance.length },
    { label: 'Non-Compliant / Overdue', value: compliance.filter((c) => ['Non-Compliant', 'Overdue'].includes(c.status)).length },
    { label: 'Corrective Actions', value: actions.length },
    { label: 'Overdue Corrective Actions', value: actions.filter((a) => a.isOverdue).length },
  ];

  if (reportType === 'Risk Report' && risk) {
    sections.push({ label: 'Risk Score', value: `${risk.score}/100 (${risk.level})` });
  }

  if (reportType === 'Contractor Performance') {
    mockContractors
      .filter((c) => !mineId || c.primaryMineId === mineId)
      .forEach((c) => sections.push({ label: c.name, value: `${mockContractorPerformance[c.id]?.overall ?? '—'}%` }));
  }

  return {
    id: `RPT-${Date.now()}`,
    reportType,
    scope: scopeLabel,
    generatedAt: new Date().toISOString(),
    sections,
  };
}

async function generateReport({ reportType, mineId, fromDate, toDate }) {
  if (USE_MOCKS) return mockDelay(buildMockReport(reportType, mineId), 900);
  return apiClient.post('/reports', { reportType, mineId, fromDate, toDate }); // backend report-generation endpoint
}

export const reportsService = { generateReport };
