const prisma = require('../config/db');

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
    if (payload.flagId && payload.responseType) {
      let flagStatus = 'Action Required';
      if (payload.responseType === 'Resolved') flagStatus = 'Resolved';
      if (payload.responseType === 'Dismissed') flagStatus = 'Dismissed';
      if (payload.responseType === 'Action Taken') flagStatus = 'Action Taken';

      await prisma.flag.update({
        where: { id: payload.flagId },
        data: { status: flagStatus },
      }).catch(() => {});
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
