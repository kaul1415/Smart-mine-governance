const prisma = require('../config/db');
const { recordAuditLog } = require('../services/auditLogger');

const canSeeReporterIdentity = (user) => {
  if (!user) return false;
  if (user.department === 'system' || user.role === 'corporate_admin') return true;
  return ['safety_officer', 'regulator'].includes(user.role);
};

const sanitizeFlag = (flag, user) => {
  if (!flag) return null;
  if (flag.isConfidential && !canSeeReporterIdentity(user)) {
    return {
      ...flag,
      reporterName: 'Confidential Reporter',
    };
  }
  return flag;
};

const getFlags = async (req, res) => {
  try {
    const { mineId, sort, limit } = req.query;
    const where = {};

    if (mineId) {
      where.mineId = mineId;
    }

    let orderBy = { createdAt: 'desc' };
    if (sort) {
      if (sort.startsWith('-')) {
        orderBy = { [sort.substring(1)]: 'desc' };
      } else {
        orderBy = { [sort]: 'asc' };
      }
    }

    const take = limit ? parseInt(limit, 10) : undefined;

    const flags = await prisma.flag.findMany({
      where,
      orderBy,
      take,
    });

    const sanitized = flags.map((f) => sanitizeFlag(f, req.user));
    return res.status(200).json(sanitized);
  } catch (error) {
    console.error('getFlags error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching flags' });
  }
};

const getFlagsByCategory = async (req, res) => {
  try {
    const counts = await prisma.flag.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
    });

    const result = counts.map((c) => ({
      category: c.category,
      count: c._count.id,
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error('getFlagsByCategory error:', error);
    return res.status(500).json({ message: error.message || 'Error calculating flag stats' });
  }
};

const getFlagById = async (req, res) => {
  try {
    const { id } = req.params;
    const flag = await prisma.flag.findUnique({
      where: { id },
    });

    if (!flag) {
      return res.status(404).json({ message: 'Flag not found' });
    }

    return res.status(200).json(sanitizeFlag(flag, req.user));
  } catch (error) {
    console.error('getFlagById error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching flag' });
  }
};

const createFlag = async (req, res) => {
  try {
    const payload = req.body;

    const count = await prisma.flag.count();
    const id = payload.id || `F-${1021 + count + 1}`;

    let mineName = payload.mineName;
    if (!mineName && payload.mineId) {
      const mine = await prisma.mine.findUnique({ where: { id: payload.mineId } });
      if (mine) mineName = mine.name;
    }

    const flag = await prisma.flag.create({
      data: {
        id,
        category: payload.category || 'Safety',
        mineId: payload.mineId || null,
        mineName: mineName || 'Unknown Mine',
        location: payload.location || '',
        description: payload.description || '',
        severity: payload.severity || 'MEDIUM',
        status: payload.status || 'New',
        assignedAuthority: payload.assignedAuthority || 'Unassigned',
        reporterType: payload.reporterType || 'Inspector',
        isConfidential: !!payload.isConfidential,
        reporterName: payload.isConfidential
          ? payload.reporterName || `Confidential Reporter #${Math.floor(Math.random() * 9000 + 1000)}`
          : payload.reporterName || req.user.email || 'Anonymous',
        evidenceCount: payload.evidenceCount || 0,
      },
    });

    // Also update mine openFlags count
    if (flag.mineId) {
      await prisma.mine.update({
        where: { id: flag.mineId },
        data: { openFlags: { increment: 1 } },
      }).catch(() => {});
    }

    // Log to audit trail
    const actorName = flag.isConfidential
      ? 'Confidential Reporter'
      : (req.user?.name || req.user?.username || req.user?.email || 'Inspector');

    await recordAuditLog({
      user: actorName,
      actorType: 'user',
      action: 'Created flag',
      entity: flag.id,
      entityId: flag.mineId || flag.id,
      metadata: { category: flag.category, severity: flag.severity, mineName: flag.mineName },
    });

    return res.status(201).json(sanitizeFlag(flag, req.user));
  } catch (error) {
    console.error('createFlag error:', error);
    return res.status(500).json({ message: error.message || 'Error creating flag' });
  }
};

const updateFlag = async (req, res) => {
  try {
    const { id } = req.params;
    const patch = req.body;

    const oldFlag = await prisma.flag.findUnique({ where: { id } });

    const flag = await prisma.flag.update({
      where: { id },
      data: patch,
    });

    // If status changed to resolved/closed, decrement mine openFlags
    if (patch.status && ['Resolved', 'Closed'].includes(patch.status) && oldFlag && !['Resolved', 'Closed'].includes(oldFlag.status) && flag.mineId) {
      await prisma.mine.update({
        where: { id: flag.mineId },
        data: { openFlags: { decrement: 1 } },
      }).catch(() => {});
    }

    // Log to audit trail
    let actionText = 'Updated flag';
    if (patch.status) actionText = `Updated status to ${patch.status}`;
    else if (patch.assignedAuthority) actionText = `Assigned to ${patch.assignedAuthority}`;
    else if (patch.severity) actionText = `Updated severity to ${patch.severity}`;

    await recordAuditLog({
      user: req.user,
      actorType: 'user',
      action: actionText,
      entity: flag.id,
      entityId: flag.mineId || flag.id,
      metadata: patch,
    });

    return res.status(200).json(sanitizeFlag(flag, req.user));
  } catch (error) {
    console.error('updateFlag error:', error);
    return res.status(500).json({ message: error.message || 'Error updating flag' });
  }
};

module.exports = {
  getFlags,
  getFlagsByCategory,
  getFlagById,
  createFlag,
  updateFlag,
};
