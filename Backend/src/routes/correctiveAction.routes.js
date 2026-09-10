const express = require('express');
const {
  getCorrectiveActions,
  getCorrectiveActionById,
  createCorrectiveAction,
  updateCorrectiveAction,
  addComment,
} = require('../controllers/correctiveAction.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', verifyToken, getCorrectiveActions);
router.get('/:id', verifyToken, getCorrectiveActionById);
router.post('/', verifyToken, createCorrectiveAction);
router.patch('/:id', verifyToken, updateCorrectiveAction);
router.post('/:id/comments', verifyToken, addComment);

module.exports = router;
