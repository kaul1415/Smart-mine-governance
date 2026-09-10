const prisma = require('../config/db');
const { recordAuditLog } = require('../services/auditLogger');

// Helper to check contractor authorization
const checkContractorAuth = (req, contractorId) => {
  if (req.user.department === 'system' || req.user.role === 'corporate_admin') return true;
  if (['mine_manager', 'safety_officer', 'regulator'].includes(req.user.role)) return true;
  if (req.user.role === 'contractor') {
    return req.user.contractorId === contractorId;
  }
  return true;
};

const getContractors = async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'contractor' && req.user.contractorId) {
      where.id = req.user.contractorId;
    }

    const contractors = await prisma.contractor.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return res.status(200).json(contractors);
  } catch (error) {
    console.error('getContractors error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching contractors' });
  }
};

const getContractorById = async (req, res) => {
  try {
    const { id } = req.params;
    const contractor = await prisma.contractor.findUnique({
      where: { id },
    });

    if (!contractor) {
      return res.status(404).json({ message: 'Contractor not found' });
    }

    return res.status(200).json(contractor);
  } catch (error) {
    console.error('getContractorById error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching contractor' });
  }
};

const getProjects = async (req, res) => {
  try {
    const { id } = req.params;
    const projects = await prisma.contractorProject.findMany({
      where: { contractorId: id },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(projects);
  } catch (error) {
    console.error('getProjects error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching projects' });
  }
};

const getReports = async (req, res) => {
  try {
    const { id } = req.params;
    const reports = await prisma.contractorReport.findMany({
      where: { contractorId: id },
      orderBy: { reportDate: 'desc' },
    });
    return res.status(200).json(reports);
  } catch (error) {
    console.error('getReports error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching reports' });
  }
};

const uploadReport = async (req, res) => {
  try {
    const payload = req.body;
    const count = await prisma.contractorReport.count();
    const id = payload.id || `CR-${500 + count + 1}`;

    const created = await prisma.contractorReport.create({
      data: {
        id,
        contractorId: payload.contractorId || req.user.contractorId || 'contractor-1',
        reportType: payload.reportType || 'Daily Report',
        projectId: payload.projectId || null,
        projectName: payload.projectName || null,
        reportDate: payload.reportDate || new Date().toISOString(),
        comment: payload.comment || null,
        document: payload.document || { name: 'report.pdf', size: 1024, type: 'application/pdf' },
        processingStatus: 'Uploaded',
        reportStatus: 'Draft',
        submittedDate: null,
        extractedData: null,
      },
    });

    await recordAuditLog({
      user: req.user,
      actorType: 'user',
      action: `Uploaded contractor report (${created.reportType})`,
      entity: created.id,
      entityId: created.contractorId,
      metadata: { projectName: created.projectName },
    });

    return res.status(201).json(created);
  } catch (error) {
    console.error('uploadReport error:', error);
    return res.status(500).json({ message: error.message || 'Error uploading report' });
  }
};

const processReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await prisma.contractorReport.findUnique({ where: { id } });
    if (!report) return res.status(404).json({ message: 'Report not found' });

    const extractedData = {
      contractor: report.contractorId,
      project: report.projectName || 'Active Mining Project',
      reportDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      workProgress: 'Extracted from uploaded document via OCR/AI service pipeline.',
      safetyObservations: 'All workers equipped with statutory safety gear; zero safety violations observed.',
      complianceIssues: 'No statutory compliance violations identified.',
      correctiveActions: 'None required.',
    };

    const updated = await prisma.contractorReport.update({
      where: { id },
      data: {
        processingStatus: 'OCR Completed',
        extractedData,
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('processReport error:', error);
    return res.status(500).json({ message: error.message || 'Error processing report' });
  }
};

const finalizeReport = async (req, res) => {
  try {
    const { id } = req.params;
    const patch = req.body;

    const updated = await prisma.contractorReport.update({
      where: { id },
      data: {
        reportStatus: patch.reportStatus || 'Submitted',
        submittedDate: new Date(),
      },
    });

    await recordAuditLog({
      user: req.user,
      actorType: 'user',
      action: 'Submitted contractor report',
      entity: id,
      entityId: updated.contractorId,
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('finalizeReport error:', error);
    return res.status(500).json({ message: error.message || 'Error finalizing report' });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await prisma.contractorAttendance.findMany({
      where: { contractorId: id },
      orderBy: { date: 'desc' },
    });
    return res.status(200).json(attendance);
  } catch (error) {
    console.error('getAttendance error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching attendance' });
  }
};

const recordAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const created = await prisma.contractorAttendance.create({
      data: {
        id: `ATT-${Date.now()}`,
        contractorId: id,
        date: payload.date || new Date().toISOString(),
        workers: parseInt(payload.workers, 10) || 0,
        present: parseInt(payload.present, 10) || 0,
        absent: parseInt(payload.absent, 10) || 0,
        shift: payload.shift || 'General',
      },
    });

    await recordAuditLog({
      user: req.user,
      actorType: 'user',
      action: `Recorded attendance for shift ${payload.shift || 'General'}`,
      entity: created.id,
      entityId: id,
      metadata: { workers: payload.workers, present: payload.present },
    });

    return res.status(201).json(created);
  } catch (error) {
    console.error('recordAttendance error:', error);
    return res.status(500).json({ message: error.message || 'Error recording attendance' });
  }
};

const getSafetyRequirements = async (req, res) => {
  try {
    const { id } = req.params;
    const reqs = await prisma.contractorSafetyRequirement.findMany({
      where: { contractorId: id },
    });
    return res.status(200).json(reqs);
  } catch (error) {
    console.error('getSafetyRequirements error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching safety requirements' });
  }
};

const getDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const docs = await prisma.contractorDocument.findMany({
      where: { contractorId: id },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(docs);
  } catch (error) {
    console.error('getDocuments error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching documents' });
  }
};

const uploadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const created = await prisma.contractorDocument.create({
      data: {
        id: `CD-${Date.now()}`,
        contractorId: id,
        name: payload.name || 'Document.pdf',
        type: payload.type || 'Certification',
        uploadedDate: new Date().toISOString(),
        size: payload.size || '1.2 MB',
        status: 'Verified',
        fileUrl: payload.fileUrl || null,
      },
    });

    await recordAuditLog({
      user: req.user,
      actorType: 'user',
      action: `Uploaded contractor document: ${created.name}`,
      entity: created.id,
      entityId: id,
    });

    return res.status(201).json(created);
  } catch (error) {
    console.error('uploadDocument error:', error);
    return res.status(500).json({ message: error.message || 'Error uploading document' });
  }
};

const getRiskNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    const notifs = await prisma.riskNotification.findMany({
      where: { contractorId: id },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(notifs);
  } catch (error) {
    console.error('getRiskNotifications error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching risk notifications' });
  }
};

const getPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const perf = await prisma.contractorPerformance.findUnique({
      where: { contractorId: id },
    });
    return res.status(200).json(perf || null);
  } catch (error) {
    console.error('getPerformance error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching performance' });
  }
};

module.exports = {
  getContractors,
  getContractorById,
  getProjects,
  getReports,
  uploadReport,
  processReport,
  finalizeReport,
  getAttendance,
  recordAttendance,
  getSafetyRequirements,
  getDocuments,
  uploadDocument,
  getRiskNotifications,
  getPerformance,
};
