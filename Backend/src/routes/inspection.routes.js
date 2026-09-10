const express = require('express');
const {
  getInspections,
  getInspectionById,
  createInspection,
  submitObservation,
} = require('../controllers/inspection.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', verifyToken, getInspections);
router.get('/:id', verifyToken, getInspectionById);
router.post(
  '/',
  verifyToken,
  requireRole('corporate_admin', 'mine_manager', 'safety_officer', 'field_inspector', 'regulator'),
  createInspection
);
router.post(
  '/:id/observations',
  verifyToken,
  requireRole('corporate_admin', 'mine_manager', 'safety_officer', 'field_inspector', 'regulator'),
  submitObservation
);

module.exports = router;
