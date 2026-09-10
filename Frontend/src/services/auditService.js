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

async function verifyAuditChain() {
  if (USE_MOCKS) {
    return mockDelay({
      verified: true,
      totalRecords: mockAuditLogs.length,
      tamperedCount: 0,
      tamperedRecords: [],
      algorithm: 'SHA-256 Merkle/Blockchain Linkage',
    });
  }
  return apiClient.get('/audit-logs/verify');
}

export const auditService = { getAuditLogs, getAuditLogsForEntity, verifyAuditChain };
