const { logAudit } = require('../utils/auditLogger');
const fs = require('fs/promises');
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8001';

async function extractUploadText(file) {
  const bytes = await fs.readFile(file.path);
  const formData = new FormData();
  formData.append('file', new Blob([bytes], { type: file.mimetype }), file.originalname);
  const response = await fetch(`${ML_SERVICE_URL}/pdf/extract-text`, { method: 'POST', body: formData });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

/**
 * Upload a PDF or evidence document
 * POST /api/uploads
 */
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded or file was rejected by filter',
      });
    }

    const category = req.query.category || req.body.category || 'documents';
    const relativeUrl = `/uploads/${category}/${req.file.filename}`;
    let extraction = null;
    if (req.file.mimetype === 'application/pdf' || req.file.mimetype.startsWith('image/')) {
      try {
        extraction = await extractUploadText(req.file);
      } catch (error) {
        console.warn('OCR/text extraction skipped:', error.message);
      }
    }

    await logAudit({
      userId: req.user?.userId,
      action: 'FILE_UPLOADED',
      entity: 'Document',
      entityId: req.file.filename,
      metadata: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        category,
        url: relativeUrl,
        extractionMethod: extraction?.extraction_method || null,
        extractedCharacters: extraction?.text?.length || 0,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        category,
        url: relativeUrl,
        extractedText: extraction?.text || '',
        extractionMethod: extraction?.extraction_method || null,
        ocrPages: extraction?.ocr_pages || 0,
      },
    });
  } catch (error) {
    console.error('uploadFile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process file upload' });
  }
};

module.exports = {
  uploadFile,
};
