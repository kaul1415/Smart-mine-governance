const prisma = require('../config/db');

/**
 * Record an audit trail entry in PostgreSQL
 * @param {Object} options
 * @param {Object|string} options.user - req.user object or string actor name
 * @param {string} options.action - readable action phrase e.g. "Created flag", "Updated status to Closed"
 * @param {string} options.entity - primary entity identifier e.g. "F-1021", "CA-1042", "INS-1023"
 * @param {string} [options.entityId] - secondary or related entity identifier (e.g. flagId or mineId)
 * @param {string} [options.actorType] - "user" | "system"
 * @param {Object} [options.metadata] - optional JSON metadata
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

    const log = await prisma.auditLog.create({
      data: {
        id: logId,
        actor,
        actorType,
        action,
        entity,
        entityId: entityId || entity,
        metadata: metadata ? metadata : undefined,
        timestamp: new Date(),
      },
    });
    return log;
  } catch (error) {
    console.error('Failed to write audit log:', error);
    return null;
  }
}

module.exports = {
  recordAuditLog,
};
