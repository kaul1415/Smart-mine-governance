const express = require('express');
const {
  getResponses,
  getResponseById,
  submitResponse,
} = require('../controllers/response.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', verifyToken, getResponses);
router.get('/:id', verifyToken, getResponseById);
router.post(
  '/',
  verifyToken,
  requireRole('corporate_admin', 'mine_manager', 'safety_officer', 'regulator'),
  submitResponse
);

module.exports = router;
