const express = require('express');
const {
  getChain,
  verifyChain,
  getBlock,
  getSummary,
} = require('../controllers/blockchain.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

/**
 * @route   GET /api/blockchain/
 * @route   GET /api/blockchain/chain
 * @desc    Fetch paginated blockchain ledger blocks
 * @access  Authenticated Users
 */
router.get('/', getChain);
router.get('/chain', getChain);

/**
 * @route   GET /api/blockchain/summary
 * @desc    Get blockchain ledger summary stats
 * @access  Authenticated Users
 */
router.get('/summary', getSummary);

/**
 * @route   GET /api/blockchain/verify
 * @desc    Run cryptographic SHA-256 integrity verification across full ledger
 * @access  ADMIN, REGULATOR, INSPECTOR, MANAGER
 */
router.get('/verify', requireRole('ADMIN', 'REGULATOR', 'INSPECTOR', 'MANAGER'), verifyChain);

/**
 * @route   GET /api/blockchain/blocks/:identifier
 * @desc    Get specific block by blockIndex, hash, or UUID
 * @access  Authenticated Users
 */
router.get('/blocks/:identifier', getBlock);

module.exports = router;
