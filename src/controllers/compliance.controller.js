const prisma = require('../config/db');
const {
  createComplianceSchema,
  updateComplianceSchema,
} = require('../validators/compliance.validator');
const { logAudit } = require('../utils/auditLogger');
const { ZodError } = require('zod');

const DEMO_COMPLIANCES = [
  {
    id: 'comp-001',
    mineId: 'mine-001',
    title: 'Environmental Clearance (EC) - MoEFCC 2026',
    category: 'ENVIRONMENT',
    status: 'COMPLIANT',
    validUntil: '2028-12-31T00:00:00.000Z',
    remarks: 'Approved for 20 MTPA production cap with dust suppression mandatory.',
    mine: { id: 'mine-001', name: 'Rajmahal Opencast Mine', code: 'MINE-JH-ECL-001', subsidiary: 'ECL', state: 'Jharkhand' },
  },
  {
    id: 'comp-002',
    mineId: 'mine-001',
    title: 'DGMS Deep-Hole Blasting Safety Permit',
    category: 'SAFETY',
    status: 'COMPLIANT',
    validUntil: '2027-06-30T00:00:00.000Z',
    remarks: 'Vibration monitoring sensors required at pit boundary.',
    mine: { id: 'mine-001', name: 'Rajmahal Opencast Mine', code: 'MINE-JH-ECL-001', subsidiary: 'ECL', state: 'Jharkhand' },
  },
  {
    id: 'comp-003',
    mineId: 'mine-002',
    title: 'Consent to Operate (CTO) Air & Water Act',
    category: 'ENVIRONMENT',
    status: 'UNDER_REVIEW',
    validUntil: '2026-10-15T00:00:00.000Z',
    remarks: 'Effluent treatment plant efficiency audit in progress.',
    mine: { id: 'mine-002', name: 'Piparwar Opencast Project', code: 'MINE-JH-CCL-002', subsidiary: 'CCL', state: 'Jharkhand' },
  },
  {
    id: 'comp-004',
    mineId: 'mine-003',
    title: 'Mines Creche & Welfare Compliance Certificate',
    category: 'LABOUR',
    status: 'COMPLIANT',
    validUntil: '2027-03-31T00:00:00.000Z',
    remarks: 'Mandatory worker healthcare checks completed.',
    mine: { id: 'mine-003', name: 'Gevra Mega Opencast Mine', code: 'MINE-CG-SECL-003', subsidiary: 'SECL', state: 'Chhattisgarh' },
  },
];

/**
 * List statutory compliances with optional filtering by mine, category, or status
 * GET /api/compliances
 */
const getCompliances = async (req, res) => {
  try {
    const { mineId, category, status, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    let total = 0;
    let compliances = [];

    try {
      const where = {};
      if (mineId) where.mineId = mineId;
      if (category) where.category = category;
      if (status) where.status = status;

      [total, compliances] = await Promise.all([
        prisma.statutoryCompliance.count({ where }),
        prisma.statutoryCompliance.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { updatedAt: 'desc' },
          include: {
            mine: {
              select: { id: true, name: true, code: true, subsidiary: true, state: true },
            },
          },
        }),
      ]);
    } catch (dbErr) {
      if (process.env.NODE_ENV !== 'production') {
        let list = DEMO_COMPLIANCES;
        if (mineId) list = list.filter((c) => c.mineId === mineId);
        if (category) list = list.filter((c) => c.category === category);
        if (status) list = list.filter((c) => c.status === status);
        total = list.length;
        compliances = list.slice(skip, skip + limitNum);
      } else {
        throw dbErr;
      }
    }

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      data: compliances,
    });
  } catch (error) {
    console.error('getCompliances error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch compliance records' });
  }
};

/**
 * Get compliance overview summary across categories (Safety, Environment, Production, Labour)
 * GET /api/compliances/summary
 */
const getComplianceSummary = async (req, res) => {
  try {
    const { mineId } = req.query;
    let total = 0;
    let compliant = 0;
    let nonCompliant = 0;
    let underReview = 0;
    let expired = 0;

    try {
      const where = mineId ? { mineId } : {};

      [total, compliant, nonCompliant, underReview, expired] = await Promise.all([
        prisma.statutoryCompliance.count({ where }),
        prisma.statutoryCompliance.count({ where: { ...where, status: 'COMPLIANT' } }),
        prisma.statutoryCompliance.count({ where: { ...where, status: 'NON_COMPLIANT' } }),
        prisma.statutoryCompliance.count({ where: { ...where, status: 'UNDER_REVIEW' } }),
        prisma.statutoryCompliance.count({ where: { ...where, status: 'EXPIRED' } }),
      ]);
    } catch (dbErr) {
      if (process.env.NODE_ENV !== 'production') {
        const list = mineId ? DEMO_COMPLIANCES.filter((c) => c.mineId === mineId) : DEMO_COMPLIANCES;
        total = list.length;
        compliant = list.filter((c) => c.status === 'COMPLIANT').length;
        nonCompliant = list.filter((c) => c.status === 'NON_COMPLIANT').length;
        underReview = list.filter((c) => c.status === 'UNDER_REVIEW').length;
        expired = list.filter((c) => c.status === 'EXPIRED').length;
      } else {
        throw dbErr;
      }
    }

    const complianceRate = total > 0 ? ((compliant / total) * 100).toFixed(1) : '100.0';

    return res.status(200).json({
      success: true,
      data: {
        total,
        compliant,
        nonCompliant,
        underReview,
        expired,
        complianceRatePercentage: parseFloat(complianceRate),
      },
    });
  } catch (error) {
    console.error('getComplianceSummary error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch compliance summary' });
  }
};

/**
 * Create a new statutory compliance requirement
 * POST /api/compliances
 */
const createCompliance = async (req, res) => {
  try {
    const validatedData = createComplianceSchema.parse(req.body);

    const mine = await prisma.mine.findUnique({ where: { id: validatedData.mineId } });
    if (!mine) {
      return res.status(404).json({ success: false, message: 'Referenced Mine not found' });
    }

    const compliance = await prisma.statutoryCompliance.create({
      data: {
        ...validatedData,
        validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : null,
      },
    });

    await logAudit({
      userId: req.user?.userId,
      action: 'COMPLIANCE_CREATED',
      entity: 'StatutoryCompliance',
      entityId: compliance.id,
      metadata: { mineId: compliance.mineId, title: compliance.title, category: compliance.category },
    });

    return res.status(201).json({
      success: true,
      message: 'Compliance record created successfully',
      data: compliance,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    console.error('createCompliance error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create compliance record' });
  }
};

/**
 * Update a statutory compliance record
 * PUT /api/compliances/:id
 */
const updateCompliance = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateComplianceSchema.parse(req.body);

    const existing = await prisma.statutoryCompliance.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Compliance record not found' });
    }

    const updated = await prisma.statutoryCompliance.update({
      where: { id },
      data: {
        ...validatedData,
        ...(validatedData.validUntil && { validUntil: new Date(validatedData.validUntil) }),
      },
    });

    await logAudit({
      userId: req.user?.userId,
      action: 'COMPLIANCE_UPDATED',
      entity: 'StatutoryCompliance',
      entityId: id,
      metadata: { changes: validatedData },
    });

    return res.status(200).json({
      success: true,
      message: 'Compliance record updated successfully',
      data: updated,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    console.error('updateCompliance error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update compliance record' });
  }
};

/**
 * Delete a statutory compliance record
 * DELETE /api/compliances/:id
 */
const deleteCompliance = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.statutoryCompliance.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Compliance record not found' });
    }

    await prisma.statutoryCompliance.delete({ where: { id } });

    await logAudit({
      userId: req.user?.userId,
      action: 'COMPLIANCE_DELETED',
      entity: 'StatutoryCompliance',
      entityId: id,
      metadata: { title: existing.title, mineId: existing.mineId },
    });

    return res.status(200).json({
      success: true,
      message: 'Compliance record deleted successfully',
    });
  } catch (error) {
    console.error('deleteCompliance error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete compliance record' });
  }
};

module.exports = {
  getCompliances,
  getComplianceSummary,
  createCompliance,
  updateCompliance,
  deleteCompliance,
};
