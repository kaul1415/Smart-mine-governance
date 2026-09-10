const crypto = require('crypto');
const prisma = require('../config/db');

const GENESIS_HASH = '0'.repeat(64);

/**
 * Recursively sort object keys for deterministic canonical JSON stringification
 */
function canonicalize(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(canonicalize);
  const sorted = {};
  for (const k of Object.keys(obj).sort()) {
    sorted[k] = canonicalize(obj[k]);
  }
  return sorted;
}

/**
 * Deterministically compute the SHA-256 cryptographic hash of an audit log entry
 */
function computeLogHash({
  id,
  timestamp,
  actor,
  actorType,
  action,
  entity,
  entityId,
  previousHash,
  metadata,
}) {
  const payload = JSON.stringify({
    id: String(id),
    timestamp: new Date(timestamp).getTime(),
    actor: String(actor || ''),
    actorType: String(actorType || 'user'),
    action: String(action || ''),
    entity: String(entity || ''),
    entityId: entityId ? String(entityId) : null,
    previousHash: String(previousHash || GENESIS_HASH),
    metadata: canonicalize(metadata || null),
  });

  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Record an audit trail entry with a cryptographic SHA-256 hash linked to the previous log
 */
async function recordAuditLog({
  user,
  action,
  entity,
  entityId = null,
  actorType = 'user',
  metadata = null,
}) {
  try {
    let actor = 'System';
    if (typeof user === 'string') {
      actor = user;
    } else if (user) {
      actor = user.name || user.username || user.email || 'User';
    }

    const logId = `AUD-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const timestamp = new Date();

    // Fetch the most recent audit log to link hashes in a cryptographic chain
    const lastLog = await prisma.auditLog.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { hash: true },
    });

    const previousHash = lastLog?.hash || GENESIS_HASH;

    const hash = computeLogHash({
      id: logId,
      timestamp,
      actor,
      actorType,
      action,
      entity,
      entityId: entityId || entity,
      previousHash,
      metadata,
    });

    const log = await prisma.auditLog.create({
      data: {
        id: logId,
        actor,
        actorType,
        action,
        entity,
        entityId: entityId || entity,
        metadata: metadata ? metadata : undefined,
        hash,
        previousHash,
        timestamp,
      },
    });

    return log;
  } catch (error) {
    console.error('Failed to write cryptographic audit log:', error);
    return null;
  }
}

/**
 * Verify the cryptographic integrity of the entire audit trail chain
 */
async function verifyAuditChain() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'asc' },
    });

    if (logs.length === 0) {
      return {
        verified: true,
        totalRecords: 0,
        tamperedCount: 0,
        tamperedRecords: [],
        message: 'No audit logs found.',
      };
    }

    let expectedPrevHash = GENESIS_HASH;
    const tampered = [];

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];

      // If old record has no hash, skip strict chain check or flag it
      if (!log.hash) {
        tampered.push({
          id: log.id,
          reason: 'Missing cryptographic hash',
          index: i,
        });
        continue;
      }

      // Check previousHash linkage
      if (i > 0 && log.previousHash && log.previousHash !== expectedPrevHash) {
        tampered.push({
          id: log.id,
          reason: `Chain broken: previousHash mismatch (expected ${expectedPrevHash.substring(0, 10)}..., got ${log.previousHash.substring(0, 10)}...)`,
          index: i,
        });
      }

      // Recompute and verify SHA-256 hash
      const recomputedHash = computeLogHash({
        id: log.id,
        timestamp: log.timestamp,
        actor: log.actor,
        actorType: log.actorType,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        previousHash: log.previousHash || expectedPrevHash,
        metadata: log.metadata,
      });

      if (recomputedHash !== log.hash) {
        tampered.push({
          id: log.id,
          reason: `Hash mismatch: data altered (expected ${recomputedHash.substring(0, 10)}..., stored ${log.hash.substring(0, 10)}...)`,
          index: i,
        });
      }

      expectedPrevHash = log.hash;
    }

    return {
      verified: tampered.length === 0,
      totalRecords: logs.length,
      tamperedCount: tampered.length,
      tamperedRecords: tampered,
      genesisHash: logs[0]?.hash || null,
      latestHash: logs[logs.length - 1]?.hash || null,
      algorithm: 'SHA-256 Merkle/Blockchain Linkage',
    };
  } catch (error) {
    console.error('Audit chain verification failed:', error);
    return {
      verified: false,
      error: error.message,
    };
  }
}

/**
 * Re-hash the entire audit chain from genesis (or backfill unhashed logs)
 */
async function backfillAuditHashes() {
  try {
    const allLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'asc' },
    });

    if (allLogs.length === 0) return 0;

    let prevHash = GENESIS_HASH;

    for (const log of allLogs) {
      const hash = computeLogHash({
        id: log.id,
        timestamp: log.timestamp,
        actor: log.actor,
        actorType: log.actorType,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        previousHash: prevHash,
        metadata: log.metadata,
      });

      await prisma.auditLog.update({
        where: { id: log.id },
        data: {
          hash,
          previousHash: prevHash,
        },
      });

      prevHash = hash;
    }

    console.log(`✅ Cryptographically chained and hashed ${allLogs.length} audit records.`);
    return allLogs.length;
  } catch (err) {
    console.error('Failed to backfill audit hashes:', err);
    return 0;
  }
}

module.exports = {
  recordAuditLog,
  computeLogHash,
  canonicalize,
  verifyAuditChain,
  backfillAuditHashes,
  GENESIS_HASH,
};
