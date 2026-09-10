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

/**
 * Get all chunks and text content for a specific document
 */
exports.getDocumentChunks = async (req, res) => {
  const { documentId } = req.params;
  try {
    const mlRes = await fetch(`${ML_SERVICE_URL}/rag/documents/${documentId}/chunks`);
    if (mlRes.ok) {
      const data = await mlRes.json();
      return res.status(200).json({ success: true, ...data });
    }

    // Try DB query if ML direct fetch failed
    const chunks = await prisma.$queryRaw`
      SELECT id, document_id, filename, content, created_at
      FROM document_chunks
      WHERE document_id = ${documentId}
      ORDER BY id ASC;
    `.catch(() => []);

    if (chunks.length > 0) {
      return res.status(200).json({
        success: true,
        document_id: documentId,
        filename: chunks[0].filename,
        chunks,
      });
    }

    res.status(404).json({ success: false, message: 'Document not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a document from RAG knowledge store
 */
exports.deleteDocument = async (req, res) => {
  const { documentId } = req.params;
  try {
    await fetch(`${ML_SERVICE_URL}/rag/documents/${documentId}`, { method: 'DELETE' }).catch(() => {});
    await prisma.$executeRaw`DELETE FROM document_chunks WHERE document_id = ${documentId};`.catch(() => {});
    res.status(200).json({ success: true, message: 'Document deleted from RAG knowledge store' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Extract structured form fields from a PDF or document using offline Donut DocVQA
 */
exports.extractFields = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { originalname, buffer, mimetype } = req.file;
    const fields = req.body.fields || '[]';
    const page = req.body.page || 0;
    const useCache = req.body.use_cache !== 'false';

    const formData = new FormData();
    const blob = new Blob([buffer], { type: mimetype });
    formData.append('file', blob, originalname);
    formData.append('fields', typeof fields === 'object' ? JSON.stringify(fields) : fields);
    formData.append('page', String(page));
    formData.append('use_cache', String(useCache));

    const mlResponse = await fetch(`${ML_SERVICE_URL}/pdf/extract-fields`, {
      method: 'POST',
      body: formData,
    });

    if (!mlResponse.ok) {
      const errText = await mlResponse.text();
      return res.status(mlResponse.status).json({
        success: false,
        message: `ML field extraction failed: ${errText}`,
      });
    }

    const data = await mlResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in document extractFields controller:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
