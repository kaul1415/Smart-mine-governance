const prisma = require('../config/db');

const generateReport = async (req, res) => {
  try {
    const { reportType, mineId, fromDate, toDate } = req.body;

    let mine = null;
    if (mineId) {
      mine = await prisma.mine.findUnique({ where: { id: mineId } });
    }

    const scopeLabel = mine ? mine.name : 'All Mines';

    const whereMine = mineId ? { mineId } : {};

    const flags = await prisma.flag.findMany({ where: whereMine });
    const compliance = await prisma.complianceRequirement.findMany({ where: whereMine });
    const actions = await prisma.correctiveAction.findMany({ where: whereMine });
    const risk = mineId ? await prisma.riskScore.findUnique({ where: { mineId } }) : null;

    const sections = [
      { label: 'Total Flags', value: flags.length },
      {
        label: 'Open Flags',
        value: flags.filter((f) => !['Resolved', 'Dismissed', 'Closed'].includes(f.status)).length,
      },
      { label: 'Compliance Requirements Tracked', value: compliance.length },
      {
        label: 'Non-Compliant / Overdue',
        value: compliance.filter((c) => ['Non-Compliant', 'Overdue'].includes(c.status)).length,
      },
      { label: 'Corrective Actions', value: actions.length },
      {
        label: 'Overdue Corrective Actions',
        value: actions.filter((a) => a.isOverdue).length,
      },
    ];

    if (reportType === 'Risk Report' && risk) {
      sections.push({ label: 'Risk Score', value: `${risk.score}/100 (${risk.level})` });
    }

    if (reportType === 'Contractor Performance') {
      const contractors = await prisma.contractor.findMany({
        where: mineId ? { primaryMineId: mineId } : {},
      });
      for (const c of contractors) {
        const perf = await prisma.contractorPerformance.findUnique({ where: { contractorId: c.id } });
        sections.push({ label: c.name, value: `${perf?.overall ?? '—'}%` });
      }
    }

    return res.status(200).json({
      id: `RPT-${Date.now()}`,
      reportType: reportType || 'Monthly Governance Report',
      scope: scopeLabel,
      generatedAt: new Date().toISOString(),
      sections,
    });
  } catch (error) {
    console.error('generateReport error:', error);
    return res.status(500).json({ message: error.message || 'Error generating report' });
  }
};

module.exports = {
  generateReport,
};
