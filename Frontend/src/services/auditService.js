import { apiClient, USE_MOCKS, mockDelay } from './api.js';
import { mockAuditLogs } from '../data/mockData.js';

async function getAuditLogs() {
  if (USE_MOCKS) return mockDelay([...mockAuditLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  const response = await apiClient.get('/audit-logs');
  return Array.isArray(response) ? response : (response?.data || []);
}

async function getAuditLogsForEntity(entityId) {
  if (USE_MOCKS) return mockDelay(mockAuditLogs.filter((log) => log.entity === entityId));
  const response = await apiClient.get(`/audit-logs?entity=${entityId}`);
  return Array.isArray(response) ? response : (response?.data || []);
}

async function verifyBlockchain() {
  if (USE_MOCKS) {
    return mockDelay({
      success: true,
      integrity: {
        isValid: true,
        totalBlocks: mockAuditLogs.length,
        message: 'Mock cryptographic blockchain verified.',
      },
    });
  }
  return apiClient.get('/blockchain/verify');
}

async function getBlockchainSummary() {
  if (USE_MOCKS) {
    return mockDelay({
      success: true,
      data: {
        totalBlocks: mockAuditLogs.length,
        status: 'SECURE',
        latestBlock: {
          blockIndex: mockAuditLogs.length,
          hash: '7d6958ca5b3112a8a641ca770a512096c588e799f02943f18dafa64d5caec4ad',
        },
      },
    });
  }
  return apiClient.get('/blockchain/summary');
}

export const auditService = {
  getAuditLogs,
  getAuditLogsForEntity,
  verifyBlockchain,
  getBlockchainSummary,
};
