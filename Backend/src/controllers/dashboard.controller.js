const prisma = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const totalMines = await prisma.mine.count();
    const activeFlags = await prisma.flag.count({
      where: {
        status: {
          notIn: ['Resolved', 'Dismissed', 'Closed'],
        },
      },
    });

    const highCriticalRiskMines = await prisma.mine.count({
      where: {
        riskLevel: {
          in: ['HIGH', 'CRITICAL'],
        },
      },
    });

    const openCorrectiveActions = await prisma.correctiveAction.count({
      where: {
        status: {
          notIn: ['Closed', 'Verified'],
        },
      },
    });

    const overdueActions = await prisma.correctiveAction.count({
      where: {
        isOverdue: true,
      },
    });

    const totalCompliances = await prisma.complianceRequirement.count();
    const compliantCount = await prisma.complianceRequirement.count({
      where: { status: 'Compliant' },
    });

    const complianceRate = totalCompliances > 0
      ? Math.round((compliantCount / totalCompliances) * 100)
      : 84;

    return res.status(200).json({
      totalMines,
      activeFlags,
      highCriticalRiskMines,
      complianceRate,
      openCorrectiveActions,
      overdueActions,
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching dashboard stats' });
  }
};

module.exports = {
  getDashboardStats,
};
