const { GENESIS_PREVIOUS_HASH, calculateHash, verifyChainIntegrity } = require('../utils/blockchain');

function getDemoBlockchain() {
  const b1 = {
    id: 'block-001',
    blockIndex: 1,
    timestamp: new Date('2026-01-01T00:00:00.000Z'),
    userId: null,
    actor: 'CoalGov Genesis Authority',
    actorType: 'system',
    action: 'GENESIS_BLOCK_INITIALIZED',
    entity: 'System',
    entityId: 'SYS-001',
    metadata: { platform: 'CoalGov Smart Mine Platform', version: '1.4.0' },
    previousHash: GENESIS_PREVIOUS_HASH,
    nonce: 0,
  };
  b1.hash = calculateHash(b1);

  const b2 = {
    id: 'block-002',
    blockIndex: 2,
    timestamp: new Date('2026-01-02T09:00:00.000Z'),
    userId: 'usr-admin-demo',
    actor: 'Dr. Rajesh Sharma',
    actorType: 'user',
    action: 'MINE_REGISTERED',
    entity: 'Mine',
    entityId: 'mine-jh-001',
    metadata: { code: 'MINE-JH-ECL-001', name: 'Rajmahal Opencast Mine', subsidiary: 'ECL' },
    previousHash: b1.hash,
    nonce: 0,
  };
  b2.hash = calculateHash(b2);

  const b3 = {
    id: 'block-003',
    blockIndex: 3,
    timestamp: new Date('2026-01-03T11:30:00.000Z'),
    userId: 'usr-inspector-demo',
    actor: 'Vikram Singh (DGMS Safety)',
    actorType: 'user',
    action: 'STATUTORY_CLEARANCE_VERIFIED',
    entity: 'StatutoryCompliance',
    entityId: 'comp-001',
    metadata: { title: 'Environmental Clearance (EC) - MoEFCC 2026', status: 'COMPLIANT' },
    previousHash: b2.hash,
    nonce: 0,
  };
  b3.hash = calculateHash(b3);

  const b4 = {
    id: 'block-004',
    blockIndex: 4,
    timestamp: new Date(),
    userId: 'usr-admin-demo',
    actor: 'System Administrator',
    actorType: 'user',
    action: 'USER_LOGIN',
    entity: 'User',
    entityId: 'usr-admin-demo',
    metadata: { loginType: 'department', department: 'system' },
    previousHash: b3.hash,
    nonce: 0,
  };
  b4.hash = calculateHash(b4);

  return [b1, b2, b3, b4];
}

/**
 * @desc    Get paginated blockchain audit log trajectory
 * @route   GET /api/blockchain/chain
 * @access  Private (Authenticated Users)
 */
const getChain = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const { action, entity, search } = req.query;

    let total = 0;
    let blocks = [];

    try {
      const where = {};
      if (action) where.action = action;
      if (entity) where.entity = entity;
      if (search) {
        where.OR = [
          { action: { contains: search, mode: 'insensitive' } },
          { entity: { contains: search, mode: 'insensitive' } },
          { hash: { contains: search, mode: 'insensitive' } },
        ];
      }

      [total, blocks] = await Promise.all([
        prisma.auditLog.count({ where }),
        prisma.auditLog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { blockIndex: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                designation: true,
              },
            },
          },
        }),
      ]);
    } catch (dbErr) {
      if (process.env.NODE_ENV !== 'production') {
        const demoBlocks = getDemoBlockchain();
        total = demoBlocks.length;
        blocks = demoBlocks.slice(skip, skip + limit);
      } else {
        throw dbErr;
      }
    }

    const formattedBlocks = blocks.map((b) => ({
      ...b,
      actor: b.actor || (b.user ? b.user.name : (b.metadata?.platform ? 'System' : 'System Officer')),
      actorType: b.actorType || (b.userId ? 'user' : 'system'),
    }));

    res.status(200).json({
      success: true,
      data: formattedBlocks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Perform live cryptographic integrity verification across all blocks
 * @route   GET /api/blockchain/verify
 * @access  Private (ADMIN, REGULATOR, INSPECTOR, MANAGER)
 */
const verifyChain = async (_req, res, next) => {
  try {
    let allBlocks = [];
    try {
      allBlocks = await prisma.auditLog.findMany({
        orderBy: { blockIndex: 'asc' },
      });
    } catch (dbErr) {
      if (process.env.NODE_ENV !== 'production') {
        allBlocks = getDemoBlockchain();
      } else {
        throw dbErr;
      }
    }

    const result = verifyChainIntegrity(allBlocks);

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      integrity: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single block details by blockIndex, hash, or ID
 * @route   GET /api/blockchain/blocks/:identifier
 * @access  Private (Authenticated Users)
 */
const getBlock = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let block;

    try {
      if (!isNaN(identifier)) {
        block = await prisma.auditLog.findUnique({
          where: { blockIndex: parseInt(identifier, 10) },
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        });
      } else {
        block = await prisma.auditLog.findFirst({
          where: {
            OR: [{ hash: identifier }, { id: identifier }],
          },
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        });
      }
    } catch (dbErr) {
      if (process.env.NODE_ENV !== 'production') {
        const demo = getDemoBlockchain();
        block = demo.find((b) => b.blockIndex == identifier || b.hash === identifier || b.id === identifier);
      } else {
        throw dbErr;
      }
    }

    if (!block) {
      return res.status(404).json({
        success: false,
        message: `Blockchain block '${identifier}' not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: block,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get summary stats of the Blockchain Audit Ledger
 * @route   GET /api/blockchain/summary
 * @access  Private (Authenticated Users)
 */
const getSummary = async (_req, res, next) => {
  try {
    let totalBlocks = 0;
    let genesisBlock = null;
    let latestBlock = null;
    let integrity = { isValid: true };

    try {
      totalBlocks = await prisma.auditLog.count();

      [genesisBlock, latestBlock] = await Promise.all([
        prisma.auditLog.findFirst({ orderBy: { blockIndex: 'asc' } }),
        prisma.auditLog.findFirst({ orderBy: { blockIndex: 'desc' } }),
      ]);

      const allBlocks = await prisma.auditLog.findMany({ orderBy: { blockIndex: 'asc' } });
      integrity = verifyChainIntegrity(allBlocks);
    } catch (dbErr) {
      if (process.env.NODE_ENV !== 'production') {
        const demo = getDemoBlockchain();
        totalBlocks = demo.length;
        genesisBlock = demo[0];
        latestBlock = demo[demo.length - 1];
        integrity = verifyChainIntegrity(demo);
      } else {
        throw dbErr;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalBlocks,
        status: integrity.isValid ? 'SECURE' : 'COMPROMISED',
        genesisBlock: genesisBlock
          ? {
              blockIndex: genesisBlock.blockIndex,
              hash: genesisBlock.hash,
              timestamp: genesisBlock.timestamp,
            }
          : null,
        latestBlock: latestBlock
          ? {
              blockIndex: latestBlock.blockIndex,
              hash: latestBlock.hash,
              timestamp: latestBlock.timestamp,
              action: latestBlock.action,
            }
          : null,
        integrityCheck: {
          isValid: integrity.isValid,
          tamperedBlock: integrity.tamperedBlock,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChain,
  verifyChain,
  getBlock,
  getSummary,
};
