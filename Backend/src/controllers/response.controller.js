const prisma = require('../config/db');
const { recordAuditLog } = require('../services/auditLogger');

const getResponses = async (req, res) => {
  try {
    const { flagId } = req.query;
    const where = {};
    if (flagId) where.flagId = flagId;

    const responses = await prisma.response.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return res.status(200).json(responses);
  } catch (error) {
    console.error('getResponses error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching responses' });
  }
};

const getResponseById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await prisma.response.findUnique({
      where: { id },
    });

    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('getResponseById error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching response' });
  }
};

const submitResponse = async (req, res) => {
  try {
    const payload = req.body;
    const count = await prisma.response.count();
    const id = payload.id || `R-${500 + count + 1}`;

    const created = await prisma.response.create({
      data: {
        id,
        flagId: payload.flagId,
        authority: payload.authority || req.user.name || 'Regulatory Authority',
        responseType: payload.responseType || 'Action Initiated',
        status: payload.status || 'Open',
        date: payload.date ? new Date(payload.date) : new Date(),
        officialResponse: payload.officialResponse || '',
        actionTaken: payload.actionTaken || null,
        reason: payload.reason || null,
        supportingDocuments: payload.supportingDocuments || [],
      },
    });

    // Update flag status if appropriate
    let targetFlag = null;
    if (payload.flagId) {
      targetFlag = await prisma.flag.findUnique({ where: { id: payload.flagId } });
      if (payload.responseType) {
        let flagStatus = 'Action Required';
        if (payload.responseType === 'Resolved') flagStatus = 'Resolved';
        if (payload.responseType === 'Dismissed') flagStatus = 'Dismissed';
        if (payload.responseType === 'Action Taken') flagStatus = 'Action Taken';

        await prisma.flag.update({
          where: { id: payload.flagId },
          data: { status: flagStatus },
        }).catch(() => {});

        if (['Resolved', 'Dismissed'].includes(flagStatus) && targetFlag && targetFlag.mineId && !['Resolved', 'Dismissed'].includes(targetFlag.status)) {
          await prisma.mine.update({
            where: { id: targetFlag.mineId },
            data: { openFlags: { decrement: 1 } },
          }).catch(() => {});
        }
      }
    }

    // Log to audit trail
    const authorityActor = payload.authority || req.user?.name || req.user?.username || 'Regulatory Authority';

    // 1. Audit log for the response itself
    await recordAuditLog({
      user: authorityActor,
      actorType: 'user',
      action: payload.responseType ? `Submitted official response: ${payload.responseType}` : 'Submitted official response',
      entity: created.id,
      entityId: created.flagId || null,
      metadata: {
        flagId: created.flagId,
        responseType: created.responseType,
        authority: created.authority,
      },
    });

    // 2. Audit log on the flag ticket so flag timeline shows it
    if (payload.flagId) {
      await recordAuditLog({
        user: authorityActor,
        actorType: 'user',
        action: `Submitted response (${created.responseType})`,
        entity: payload.flagId,
        entityId: created.id,
      });
    }

    return res.status(201).json(created);
  } catch (error) {
    console.error('submitResponse error:', error);
    return res.status(500).json({ message: error.message || 'Error creating response' });
  }
};

module.exports = {
  getResponses,
  getResponseById,
  submitResponse,
};
