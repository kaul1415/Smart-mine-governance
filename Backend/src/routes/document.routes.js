const express = require('express');
const multer = require('multer');
const router = express.Router();
const documentController = require('../controllers/document.controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
});

router.post('/', upload.single('file'), documentController.uploadDocument);
router.get('/', documentController.getDocuments);
router.get('/:documentId/chunks', documentController.getDocumentChunks);
router.delete('/:documentId', documentController.deleteDocument);

module.exports = router;
