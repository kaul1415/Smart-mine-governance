const prisma = require('../config/db');
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8001';

/**
 * Uploads a document and forwards it to ML /rag/ingest for chunking and embedding
 */
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { originalname, buffer, mimetype } = req.file;

    // Build FormData to forward to ML service
    const formData = new FormData();
    const blob = new Blob([buffer], { type: mimetype });
    formData.append('file', blob, originalname);

    const mlResponse = await fetch(`${ML_SERVICE_URL}/rag/ingest`, {
      method: 'POST',
      body: formData,
    });

    if (!mlResponse.ok) {
      const errText = await mlResponse.text();
      return res.status(mlResponse.status).json({
        success: false,
        message: `ML service ingestion failed: ${errText}`,
      });
    }

    const data = await mlResponse.json();
    return res.status(200).json({
      success: true,
      message: 'Document ingested and indexed successfully',
      ...data,
    });
  } catch (error) {
    console.error('Error in document upload controller:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * List all ingested document sources
 */
exports.getDocuments = async (req, res) => {
  try {
    let docs = [];
    try {
      docs = await prisma.$queryRaw`
        SELECT DISTINCT document_id, filename, COUNT(*) as chunks, MIN(created_at) as created_at
        FROM document_chunks
        GROUP BY document_id, filename
        ORDER BY created_at DESC;
      `;
    } catch (_) {}

    if (!docs || docs.length === 0) {
      try {
        const mlRes = await fetch(`${ML_SERVICE_URL}/rag/documents`);
        if (mlRes.ok) {
          const mlData = await mlRes.json();
          docs = mlData.documents || [];
        }
      } catch (_) {}
    }

    res.status(200).json({
      success: true,
      documents: docs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
