const express = require('express');
const {
  getFlags,
  getFlagsByCategory,
  getFlagById,
  createFlag,
  updateFlag,
} = require('../controllers/flag.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', verifyToken, getFlags);
router.get('/stats/by-category', verifyToken, getFlagsByCategory);
router.get('/:id', verifyToken, getFlagById);
router.post('/', verifyToken, createFlag);
router.patch('/:id', verifyToken, updateFlag);

module.exports = router;
