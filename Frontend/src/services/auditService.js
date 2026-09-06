import { apiClient, USE_MOCKS, mockDelay } from './api.js';
import { mockAuditLogs } from '../data/mockData.js';

async function getAuditLogs() {
  if (USE_MOCKS) return mockDelay([...mockAuditLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  return apiClient.get('/audit-logs'); // GET /audit-logs
}

async function getAuditLogsForEntity(entityId) {
  if (USE_MOCKS) return mockDelay(mockAuditLogs.filter((log) => log.entity === entityId));
  return apiClient.get(`/audit-logs?entity=${entityId}`);
}

export const auditService = { getAuditLogs, getAuditLogsForEntity };
