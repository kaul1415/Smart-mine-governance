const express = require('express');
const {
  getMines,
  getMineById,
  createMine,
  updateMine,
  deleteMine,
} = require('../controllers/mine.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/mines
 * @desc    Get all mines with pagination and filters
 * @access  Private (Authenticated users)
 */
router.get('/', verifyToken, getMines);

/**
 * @route   GET /api/mines/:id
 * @desc    Get mine details by ID
 * @access  Private (Authenticated users)
 */
router.get('/:id', verifyToken, getMineById);

/**
 * @route   POST /api/mines
 * @desc    Register a new mine
 * @access  Private (ADMIN, REGULATOR, MANAGER)
 */
router.post(
  '/',
  verifyToken,
  requireRole('ADMIN', 'REGULATOR', 'MANAGER'),
  createMine
);

/**
 * @route   PUT /api/mines/:id
 * @desc    Update mine details
 * @access  Private (ADMIN, REGULATOR, MANAGER)
 */
router.put(
  '/:id',
  verifyToken,
  requireRole('ADMIN', 'REGULATOR', 'MANAGER'),
  updateMine
);

/**
 * @route   DELETE /api/mines/:id
 * @desc    Delete a mine
 * @access  Private (ADMIN)
 */
router.delete('/:id', verifyToken, requireRole('ADMIN'), deleteMine);

module.exports = router;
