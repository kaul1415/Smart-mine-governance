const prisma = require('../config/db');
const { GENESIS_PREVIOUS_HASH, calculateHash } = require('./blockchain');

/**
 * Creates an immutable, cryptographically chained blockchain audit trail entry with retry on concurrency conflict
 * @param {object} param0
 * @param {string|null} param0.userId - ID of the user performing the action
 * @param {string} param0.action - Action identifier (e.g. "INSPECTION_CREATED", "VIOLATION_ASSIGNED")
 * @param {string} param0.entity - Entity name ("Mine", "Inspection", "Violation", "CorrectiveAction", "System")
 * @param {string|null} param0.entityId - Primary key ID of the entity
 * @param {object|null} param0.metadata - Additional contextual JSON data
 * @param {number} [attempt=1]
 * @returns {Promise<object|null>} Recorded audit log block
 */
const logAudit = async ({ userId = null, action, entity, entityId = null, metadata = null }, attempt = 1) => {
  try {
    // 1. Fetch latest block in the audit trail chain
    const latestBlock = await prisma.auditLog.findFirst({
      orderBy: { blockIndex: 'desc' },
    });

    const blockIndex = latestBlock ? latestBlock.blockIndex + 1 : 1;
    const previousHash = latestBlock ? latestBlock.hash : GENESIS_PREVIOUS_HASH;
    const timestamp = new Date();
    const nonce = 0;

    // 2. Compute SHA-256 block hash
    const hash = calculateHash({
      blockIndex,
      timestamp,
      userId,
      action,
      entity,
      entityId,
      metadata: metadata || {},
      previousHash,
      nonce,
    });

    // 3. Persist cryptographically linked block to PostgreSQL
    const newBlock = await prisma.auditLog.create({
      data: {
        blockIndex,
        userId,
        action,
        entity,
        entityId,
        metadata: metadata || {},
        previousHash,
        hash,
        nonce,
        timestamp,
      },
    });

    return newBlock;
  } catch (error) {
    // If DB is offline/unreachable, skip retry to avoid latency
    const isConnectionError = error.message && (error.message.includes("Can't reach database server") || error.code === 'P1001');
    if (attempt < 3 && !isConnectionError) {
      return logAudit({ userId, action, entity, entityId, metadata }, attempt + 1);
    }
    console.warn(`⚠️ Blockchain Audit Log Notice [${action} on ${entity}]: DB offline or block skipped`);
    return null;
  }
};

module.exports = {
  logAudit,
};
