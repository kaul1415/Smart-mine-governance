const prisma = require('../config/db');

const getRiskScores = async (req, res) => {
  try {
    const scores = await prisma.riskScore.findMany({
      orderBy: { score: 'desc' },
    });
    return res.status(200).json(scores);
  } catch (error) {
    console.error('getRiskScores error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching risk scores' });
  }
};

const getRiskForMine = async (req, res) => {
  try {
    const { id } = req.params;
    const score = await prisma.riskScore.findUnique({
      where: { mineId: id },
    });
    if (!score) {
      return res.status(404).json({ message: 'Risk score not found for mine' });
    }
    return res.status(200).json(score);
  } catch (error) {
    console.error('getRiskForMine error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching risk score' });
  }
};

const getRecurringIssues = async (req, res) => {
  try {
    const issues = await prisma.recurringIssue.findMany({
      orderBy: { occurrencesLast3Months: 'desc' },
    });
    return res.status(200).json(issues);
  } catch (error) {
    console.error('getRecurringIssues error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching recurring issues' });
  }
};

module.exports = {
  getRiskScores,
  getRiskForMine,
  getRecurringIssues,
};
