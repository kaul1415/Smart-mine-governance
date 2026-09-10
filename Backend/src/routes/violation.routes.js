const express = require('express');
const {
  getViolations,
  getViolationById,
  createViolation,
  assignCorrectiveAction,
  submitMineResponse,
  updateCorrectiveActionStatus,
} = require('../controllers/violation.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/violations
 * @desc    Get all violations with filters
 * @access  Private
 */
router.get('/', verifyToken, getViolations);

/**
 * @route   GET /api/violations/:id
 * @desc    Get violation details by ID
 * @access  Private
 */
router.get('/:id', verifyToken, getViolationById);

/**
 * @route   POST /api/violations
 * @desc    Report a new violation with optional Notice PDF
 * @access  Private (ADMIN, INSPECTOR, REGULATOR)
 */
router.post(
  '/',
  verifyToken,
  requireRole('ADMIN', 'INSPECTOR', 'REGULATOR'),
  createViolation
);

/**
 * @route   POST /api/violations/:id/actions
 * @desc    Assign a corrective action plan to a user
 * @access  Private (ADMIN, INSPECTOR, MANAGER)
 */
router.post(
  '/:id/actions',
  verifyToken,
  requireRole('ADMIN', 'INSPECTOR', 'MANAGER'),
  assignCorrectiveAction
);

/**
 * @route   POST /api/violations/actions/:actionId/response
 * @desc    Mine Official / Manager submits formal response (written + PDF report / evidence)
 * @access  Private (ADMIN, MANAGER, MINE_OFFICIAL)
 */
router.post(
  '/actions/:actionId/response',
  verifyToken,
  requireRole('ADMIN', 'MANAGER', 'MINE_OFFICIAL'),
  submitMineResponse
);

/**
 * @route   PUT /api/violations/actions/:actionId
 * @desc    Update status of corrective action (e.g., VERIFIED by Inspector)
 * @access  Private (ADMIN, MANAGER, MINE_OFFICIAL, INSPECTOR)
 */
router.put(
  '/actions/:actionId',
  verifyToken,
  requireRole('ADMIN', 'MANAGER', 'MINE_OFFICIAL', 'INSPECTOR'),
  updateCorrectiveActionStatus
);

module.exports = router;
