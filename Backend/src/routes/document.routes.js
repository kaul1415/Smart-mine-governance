const express = require('express');
const {
  getDocuments,
  getDocumentById,
  uploadDocument,
} = require('../controllers/document.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', verifyToken, getDocuments);
router.get('/:id', verifyToken, getDocumentById);
router.post('/', verifyToken, uploadDocument);

module.exports = router;
