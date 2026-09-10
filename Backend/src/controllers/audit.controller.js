const prisma = require('../config/db');
const { verifyAuditChain } = require('../services/auditLogger');

const getAuditLogs = async (req, res) => {
  try {
    const { entity, limit } = req.query;
    const where = {};
    if (entity) {
      where.OR = [
        { entity },
        { entityId: entity },
      ];
    }

    const take = limit ? parseInt(limit, 10) : undefined;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take,
    });

    return res.status(200).json(logs);
  } catch (error) {
    console.error('getAuditLogs error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching audit logs' });
  }
};

const verifyAuditLogs = async (req, res) => {
  try {
    const result = await verifyAuditChain();
    return res.status(200).json(result);
  } catch (error) {
    console.error('verifyAuditLogs error:', error);
    return res.status(500).json({ message: error.message || 'Error verifying audit chain' });
  }
};

module.exports = {
  getAuditLogs,
  verifyAuditLogs,
};
