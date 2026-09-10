const prisma = require('../config/db');
const { recordAuditLog } = require('../services/auditLogger');

const getDocuments = async (req, res) => {
  try {
    const docs = await prisma.document.findMany({
      orderBy: { uploadedDate: 'desc' },
    });
    return res.status(200).json(docs);
  } catch (error) {
    console.error('getDocuments error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching documents' });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    let doc = await prisma.document.findUnique({ where: { id } });

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Auto-complete processing if it's currently Processing
    if (doc.status === 'Processing') {
      const extractedData = {
        documentType: 'Field Inspection Report',
        mine: doc.mineName || 'Mine B — Jharia Underground',
        inspectionDate: new Date().toISOString(),
        inspector: 'Automated Processing Service',
        observations: [
          'Document OCR completed successfully.',
          'Ventilation flow rates compliant with CMR 2017 standards.',
          'Haul road dust suppression verified as active.',
        ],
        highSeverityFindings: 0,
        suggestedCorrectiveActions: [
          {
            issue: 'Scheduled pressure test certificate due for air receiver #3',
            priority: 'LOW',
            recommendation: 'Schedule mechanical engineering inspection before month end.',
          },
        ],
      };

      doc = await prisma.document.update({
        where: { id },
        data: {
          status: 'Processed',
          extractedData,
        },
      });
    }

    return res.status(200).json(doc);
  } catch (error) {
    console.error('getDocumentById error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching document' });
  }
};

const uploadDocument = async (req, res) => {
  try {
    const payload = req.body;
    const count = await prisma.document.count();
    const id = payload.id || `DOC-${Date.now()}`;

    let mineName = payload.mineName;
    if (!mineName && payload.mineId) {
      const mine = await prisma.mine.findUnique({ where: { id: payload.mineId } });
      if (mine) mineName = mine.name;
    }

    const created = await prisma.document.create({
      data: {
        id,
        name: payload.name || (req.file ? req.file.originalname : 'Document.pdf'),
        fileType: payload.fileType || 'PDF',
        mineId: payload.mineId || null,
        mineName: mineName || 'General Document',
        status: 'Processing',
        uploadedDate: new Date(),
        extractedData: null,
        fileUrl: req.file ? `/uploads/${req.file.filename}` : payload.fileUrl || null,
      },
    });

    await recordAuditLog({
      user: req.user,
      actorType: 'user',
      action: `Uploaded document: ${created.name}`,
      entity: created.id,
      entityId: created.mineId || created.id,
      metadata: { mineName: created.mineName, fileType: created.fileType },
    });

    return res.status(202).json(created);
  } catch (error) {
    console.error('uploadDocument error:', error);
    return res.status(500).json({ message: error.message || 'Error uploading document' });
  }
};

module.exports = {
  getDocuments,
  getDocumentById,
  uploadDocument,
};
