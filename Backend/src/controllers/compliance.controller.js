const prisma = require('../config/db');

const getComplianceRequirements = async (req, res) => {
  try {
    const { mineId } = req.query;
    const where = {};
    if (mineId) where.mineId = mineId;

    const items = await prisma.complianceRequirement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(items);
  } catch (error) {
    console.error('getComplianceRequirements error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching compliance requirements' });
  }
};

const getComplianceRequirementById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.complianceRequirement.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({ message: 'Compliance requirement not found' });
    }

    return res.status(200).json(item);
  } catch (error) {
    console.error('getComplianceRequirementById error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching compliance requirement' });
  }
};

module.exports = {
  getComplianceRequirements,
  getComplianceRequirementById,
};
