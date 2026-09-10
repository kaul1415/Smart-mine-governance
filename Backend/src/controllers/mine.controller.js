const prisma = require('../config/db');

const getMines = async (req, res) => {
  try {
    const { riskLevel } = req.query;
    const where = {};

    if (riskLevel) {
      const levels = riskLevel.split(',').map((l) => l.trim().toUpperCase());
      where.riskLevel = { in: levels };
    }

    const mines = await prisma.mine.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return res.status(200).json(mines);
  } catch (error) {
    console.error('getMines error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching mines' });
  }
};

const getMineById = async (req, res) => {
  try {
    const { id } = req.params;
    const mine = await prisma.mine.findUnique({
      where: { id },
    });

    if (!mine) {
      return res.status(404).json({ message: 'Mine not found' });
    }

    return res.status(200).json(mine);
  } catch (error) {
    console.error('getMineById error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching mine' });
  }
};

module.exports = {
  getMines,
  getMineById,
};
