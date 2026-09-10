const express = require('express');
const { uploadFile } = require('../controllers/upload.controller');
const { upload } = require('../middlewares/upload.middleware');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route   POST /api/uploads
 * @desc    Upload PDF report, compliance certificate, or response document
 * @access  Private (Authenticated users)
 * @query   category - 'documents' | 'reports' | 'responses' (default: 'documents')
 * @formdata file - The binary file (PDF or Image)
 */
router.post('/', verifyToken, upload.single('file'), uploadFile);

module.exports = router;
