import { apiClient, USE_MOCKS, mockDelay } from './api.js';
import { mockFlags, FLAG_CATEGORIES } from '../data/mockData.js';

// Helper to ensure an array of flags has no duplicate IDs
function deduplicateFlags(flagList) {
  const map = new Map();
  for (const flag of flagList) {
    if (flag && flag.id) {
      map.set(flag.id, flag);
    }
  }
  return Array.from(map.values());
}

// In-memory store initialized with deduplicated mock flags
let flags = deduplicateFlags([...mockFlags]);

// Helper to calculate the next unique ticket ID (e.g., F-1022)
function getNextTicketId() {
  const existingNumbers = flags.map((f) => {
    const match = f.id && f.id.match(/^F-(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  });
  const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers, 1021) : 1021;
  return `F-${maxNumber + 1}`;
}

// Helper to compute flags-by-category dynamically from the single source of truth
function computeFlagsByCategory() {
  const uniqueFlags = deduplicateFlags(flags);
  return FLAG_CATEGORIES.map((cat) => ({
    category: cat,
    count: uniqueFlags.filter((f) => f.category === cat).length,
  }));
}

async function getFlags() {
  if (USE_MOCKS) {
    const unique = deduplicateFlags(flags);
    const sorted = [...unique].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return mockDelay(sorted);
  }
  const data = await apiClient.get('/flags'); // GET /flags
  return deduplicateFlags(Array.isArray(data) ? data : []);
}

async function getRecentFlags(limit = 5) {
  if (USE_MOCKS) {
    const unique = deduplicateFlags(flags);
    const sorted = [...unique].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return mockDelay(sorted.slice(0, limit));
  }
  const data = await apiClient.get(`/flags?sort=-createdAt&limit=${limit}`);
  return deduplicateFlags(Array.isArray(data) ? data : []);
}

async function getFlagsByCategory() {
  if (USE_MOCKS) {
    return mockDelay(computeFlagsByCategory());
  }
  return apiClient.get('/flags/stats/by-category');
}

async function getFlagById(id) {
  if (USE_MOCKS) {
    const found = flags.find((f) => f.id === id) ?? null;
    return mockDelay(found);
  }
  return apiClient.get(`/flags/${id}`); // GET /flags/:id
}

async function getFlagsForMine(mineId) {
  if (USE_MOCKS) {
    const unique = deduplicateFlags(flags);
    return mockDelay(unique.filter((f) => f.mineId === mineId));
  }
  const data = await apiClient.get(`/flags?mineId=${mineId}`);
  return deduplicateFlags(Array.isArray(data) ? data : []);
}

async function createFlag(payload) {
  if (USE_MOCKS) {
    // 1. Check for duplicate submission by clientSubmissionId (offline sync idempotency)
    if (payload.clientSubmissionId) {
      const existing = flags.find((f) => f.clientSubmissionId === payload.clientSubmissionId);
      if (existing) {
        return mockDelay(existing, 300);
      }
    }

    // 2. Check for duplicate flag by matching ID if explicitly provided
    if (payload.id) {
      const existing = flags.find((f) => f.id === payload.id);
      if (existing) {
        return mockDelay(existing, 300);
      }
    }

    // 3. Check for identical rapid resubmission (same mine, location, description within 10 seconds)
    const now = Date.now();
    const isRapidDuplicate = flags.some((f) => {
      const isSameContent =
        f.mineId === payload.mineId &&
        f.location === payload.location &&
        f.description === payload.description &&
        f.category === payload.category;
      const createdAtMs = new Date(f.createdAt).getTime();
      return isSameContent && Math.abs(now - createdAtMs) < 10000;
    });

    if (isRapidDuplicate) {
      const existing = flags.find(
        (f) =>
          f.mineId === payload.mineId &&
          f.location === payload.location &&
          f.description === payload.description
      );
      if (existing) return mockDelay(existing, 300);
    }

    // 4. Generate a strictly unique sequential Ticket ID
    const newId = payload.id || getNextTicketId();

    const newFlag = {
      ...payload,
      id: newId,
      status: payload.status || 'New',
      assignedAuthority: payload.assignedAuthority || 'Unassigned',
      createdAt: payload.createdAt || new Date().toISOString(),
      isConfidential: Boolean(payload.isConfidential),
      reporterName: payload.isConfidential
        ? `Confidential Reporter #${Math.floor(Math.random() * 9000 + 1000)}`
        : payload.reporterName || 'Anonymous',
    };

    // Prepend and ensure strict uniqueness in the in-memory array
    flags = deduplicateFlags([newFlag, ...flags]);

    return mockDelay(newFlag, 600);
  }

  return apiClient.post('/flags', payload); // POST /flags
}

async function updateFlag(id, patch) {
  if (USE_MOCKS) {
    flags = flags.map((f) => (f.id === id ? { ...f, ...patch } : f));
    flags = deduplicateFlags(flags);
    return mockDelay(flags.find((f) => f.id === id), 400);
  }
  return apiClient.patch(`/flags/${id}`, patch); // PATCH /flags/:id
}

export const flagService = {
  getFlags,
  getRecentFlags,
  getFlagsByCategory,
  getFlagById,
  getFlagsForMine,
  createFlag,
  updateFlag,
};
