const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notification.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', verifyToken, getNotifications);
router.patch('/mark-all-read', verifyToken, markAllAsRead);
router.patch('/:id', verifyToken, markAsRead);

module.exports = router;
