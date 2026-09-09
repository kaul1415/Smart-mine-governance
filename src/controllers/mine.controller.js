const prisma = require('../config/db');
const {
  createMineSchema,
  updateMineSchema,
  mineFilterQuerySchema,
} = require('../validators/mine.validator');
const { logAudit } = require('../utils/auditLogger');
const { ZodError } = require('zod');

/**
 * List mines with pagination, search, and filtering
 * GET /api/mines
 */
const getMines = async (req, res) => {
  try {
    const query = mineFilterQuerySchema.parse(req.query);
    const { search, subsidiary, state, operationalStatus, page, limit } = query;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (subsidiary) {
      where.subsidiary = { equals: subsidiary, mode: 'insensitive' };
    }

    if (state) {
      where.state = { equals: state, mode: 'insensitive' };
    }

    if (operationalStatus) {
      where.operationalStatus = operationalStatus;
    }

    const skip = (page - 1) * limit;

    let total = 0;
    let mines = [];

    try {
      [total, mines] = await Promise.all([
        prisma.mine.count({ where }),
        prisma.mine.findMany({
          where,
          skip,
          take: limit,
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: {
                inspections: true,
                compliances: true,
              },
            },
          },
        }),
      ]);
    } catch (dbErr) {
      if (process.env.NODE_ENV !== 'production') {
        const DEMO_MINES = [
          {
            id: 'mine-001',
            code: 'MINE-JH-ECL-001',
            name: 'Rajmahal Opencast Mine',
            subsidiary: 'ECL',
            state: 'Jharkhand',
            district: 'Godda',
            latitude: 25.0489,
            longitude: 87.3512,
            operationalStatus: 'ACTIVE',
            riskScore: 32,
            riskLevel: 'LOW',
            complianceRate: 94,
            _count: { inspections: 4, compliances: 6 },
          },
          {
            id: 'mine-002',
            code: 'MINE-JH-CCL-002',
            name: 'Piparwar Opencast Project',
            subsidiary: 'CCL',
            state: 'Jharkhand',
            district: 'Chatra',
            latitude: 23.7194,
            longitude: 85.0315,
            operationalStatus: 'ACTIVE',
            riskScore: 78,
            riskLevel: 'HIGH',
            complianceRate: 72,
            _count: { inspections: 8, compliances: 4 },
          },
          {
            id: 'mine-003',
            code: 'MINE-CG-SECL-003',
            name: 'Gevra Mega Opencast Mine',
            subsidiary: 'SECL',
            state: 'Chhattisgarh',
            district: 'Korba',
            latitude: 22.3481,
            longitude: 82.5931,
            operationalStatus: 'ACTIVE',
            riskScore: 54,
            riskLevel: 'MEDIUM',
            complianceRate: 88,
            _count: { inspections: 12, compliances: 9 },
          },
        ];
        total = DEMO_MINES.length;
        mines = DEMO_MINES;
      } else {
        throw dbErr;
      }
    }

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      data: mines,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: error.errors,
      });
    }
    console.error('getMines error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch mines' });
  }
};

/**
 * Get single mine by ID with compliance & recent inspection summary
 * GET /api/mines/:id
 */
const getMineById = async (req, res) => {
  try {
    const { id } = req.params;

    const mine = await prisma.mine.findUnique({
      where: { id },
      include: {
        compliances: {
          orderBy: { updatedAt: 'desc' },
        },
        inspections: {
          take: 5,
          orderBy: { scheduledDate: 'desc' },
          include: {
            inspector: {
              select: { id: true, name: true, email: true, designation: true },
            },
            _count: {
              select: { violations: true },
            },
          },
        },
      },
    });

    if (!mine) {
      return res.status(404).json({
        success: false,
        message: 'Mine not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: mine,
    });
  } catch (error) {
    console.error('getMineById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch mine details' });
  }
};

/**
 * Create a new mine
 * POST /api/mines
 */
const createMine = async (req, res) => {
  try {
    const validatedData = createMineSchema.parse(req.body);

    const existingMine = await prisma.mine.findUnique({
      where: { code: validatedData.code },
    });

    if (existingMine) {
      return res.status(409).json({
        success: false,
        message: `Mine with code ${validatedData.code} already exists`,
      });
    }

    const mine = await prisma.mine.create({
      data: validatedData,
    });

    await logAudit({
      userId: req.user?.userId,
      action: 'MINE_CREATED',
      entity: 'Mine',
      entityId: mine.id,
      metadata: { code: mine.code, name: mine.name, subsidiary: mine.subsidiary },
    });

    return res.status(201).json({
      success: true,
      message: 'Mine registered successfully',
      data: mine,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    console.error('createMine error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create mine' });
  }
};

/**
 * Update an existing mine
 * PUT /api/mines/:id
 */
const updateMine = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateMineSchema.parse(req.body);

    const existing = await prisma.mine.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Mine not found' });
    }

    if (validatedData.code && validatedData.code !== existing.code) {
      const duplicate = await prisma.mine.findUnique({ where: { code: validatedData.code } });
      if (duplicate) {
        return res.status(409).json({ success: false, message: 'Mine code is already in use' });
      }
    }

    const updatedMine = await prisma.mine.update({
      where: { id },
      data: validatedData,
    });

    await logAudit({
      userId: req.user?.userId,
      action: 'MINE_UPDATED',
      entity: 'Mine',
      entityId: id,
      metadata: { changes: validatedData },
    });

    return res.status(200).json({
      success: true,
      message: 'Mine updated successfully',
      data: updatedMine,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    console.error('updateMine error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update mine' });
  }
};

/**
 * Delete a mine
 * DELETE /api/mines/:id
 */
const deleteMine = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.mine.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Mine not found' });
    }

    await prisma.mine.delete({ where: { id } });

    await logAudit({
      userId: req.user?.userId,
      action: 'MINE_DELETED',
      entity: 'Mine',
      entityId: id,
      metadata: { code: existing.code, name: existing.name },
    });

    return res.status(200).json({
      success: true,
      message: 'Mine deleted successfully',
    });
  } catch (error) {
    console.error('deleteMine error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete mine' });
  }
};

module.exports = {
  getMines,
  getMineById,
  createMine,
  updateMine,
  deleteMine,
};
