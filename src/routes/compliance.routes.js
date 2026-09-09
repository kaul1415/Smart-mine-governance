const express = require('express');
const {
  getCompliances,
  getComplianceSummary,
  createCompliance,
  updateCompliance,
  deleteCompliance,
} = require('../controllers/compliance.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/compliances/summary
 * @desc    Get aggregate compliance summary and rates
 * @access  Private
 */
router.get('/summary', verifyToken, getComplianceSummary);

/**
 * @route   GET /api/compliances
 * @desc    List all statutory compliances
 * @access  Private
 */
router.get('/', verifyToken, getCompliances);

/**
 * @route   POST /api/compliances
 * @desc    Create statutory compliance requirement
 * @access  Private (ADMIN, REGULATOR, MANAGER, MINE_OFFICIAL)
 */
router.post(
  '/',
  verifyToken,
  requireRole('ADMIN', 'REGULATOR', 'MANAGER', 'MINE_OFFICIAL'),
  createCompliance
);

/**
 * @route   PUT /api/compliances/:id
 * @desc    Update statutory compliance status or details
 * @access  Private (ADMIN, REGULATOR, INSPECTOR, MANAGER)
 */
router.put(
  '/:id',
  verifyToken,
  requireRole('ADMIN', 'REGULATOR', 'INSPECTOR', 'MANAGER'),
  updateCompliance
);

/**
 * @route   DELETE /api/compliances/:id
 * @desc    Delete statutory compliance record
 * @access  Private (ADMIN, REGULATOR)
 */
router.delete(
  '/:id',
  verifyToken,
  requireRole('ADMIN', 'REGULATOR'),
  deleteCompliance
);

module.exports = router;
