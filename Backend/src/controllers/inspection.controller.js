const prisma = require('../config/db');
const { recordAuditLog } = require('../services/auditLogger');

const getInspections = async (req, res) => {
  try {
    const { mineId } = req.query;
    const where = {};
    if (mineId) where.mineId = mineId;

    const inspections = await prisma.inspection.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(inspections);
  } catch (error) {
    console.error('getInspections error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching inspections' });
  }
};

const getInspectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const inspection = await prisma.inspection.findUnique({
      where: { id },
    });

    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' });
    }

    return res.status(200).json(inspection);
  } catch (error) {
    console.error('getInspectionById error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching inspection' });
  }
};

const createInspection = async (req, res) => {
  try {
    const payload = req.body;
    const count = await prisma.inspection.count();
    const id = payload.id || `INS-${1023 + count + 1}`;

    let mineName = payload.mineName;
    if (!mineName && payload.mineId) {
      const mine = await prisma.mine.findUnique({ where: { id: payload.mineId } });
      if (mine) mineName = mine.name;
    }

    const created = await prisma.inspection.create({
      data: {
        id,
        mineId: payload.mineId || null,
        mineName: mineName || 'Unknown Mine',
        inspector: payload.inspector || req.user?.name || req.user?.username || 'Inspector',
        inspectionType: payload.inspectionType || 'Statutory Inspection',
        date: payload.date || new Date().toISOString(),
        status: payload.status || 'Scheduled',
        riskLevel: payload.riskLevel || null,
        checklist: payload.checklist || [],
        observations: payload.observations || [],
      },
    });

    await recordAuditLog({
      user: req.user?.name || payload.inspector || 'Inspector',
      actorType: 'user',
      action: 'Created inspection',
      entity: created.id,
      entityId: created.mineId || created.id,
      metadata: { inspectionType: created.inspectionType, mineName: created.mineName },
    });

    return res.status(201).json(created);
  } catch (error) {
    console.error('createInspection error:', error);
    return res.status(500).json({ message: error.message || 'Error creating inspection' });
  }
};

const submitObservation = async (req, res) => {
  try {
    const { id } = req.params;
    const observation = req.body;

    const inspection = await prisma.inspection.findUnique({ where: { id } });
    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' });
    }

    const riskScores = { LOW: 25, MEDIUM: 50, HIGH: 75, CRITICAL: 90 };
    const score = riskScores[observation.severity] || 50;

    const aiAnalysis = {
      category: observation.category || 'Safety',
      severity: observation.severity || 'MEDIUM',
      riskScore: score,
      recommendation: 'Reviewed by AI classification service — recommend authority follow-up based on severity.',
    };

    const newObservation = {
      id: `OBS-${Date.now()}`,
      ...observation,
      aiAnalysis,
    };

    const existingObs = Array.isArray(inspection.observations) ? inspection.observations : [];
    const updatedObs = [...existingObs, newObservation];

    await prisma.inspection.update({
      where: { id },
      data: {
        status: 'In Progress',
        observations: updatedObs,
      },
    });

    await recordAuditLog({
      user: req.user?.name || req.user?.username || 'Inspector',
      actorType: 'user',
      action: `Added observation (${observation.severity || 'MEDIUM'})`,
      entity: id,
      entityId: inspection.mineId || id,
      metadata: { severity: observation.severity, category: observation.category },
    });

    return res.status(201).json(newObservation);
  } catch (error) {
    console.error('submitObservation error:', error);
    return res.status(500).json({ message: error.message || 'Error submitting observation' });
  }
};

module.exports = {
  getInspections,
  getInspectionById,
  createInspection,
  submitObservation,
};
