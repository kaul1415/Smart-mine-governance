const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

// Chat streaming
router.post('/chat', chatController.handleChatStream);

// Session management
router.get('/sessions', chatController.getSessions);
router.post('/sessions', chatController.createSession);
router.post('/sessions/clear', chatController.clearUserSessions);
router.get('/sessions/:id/messages', chatController.getSessionMessages);
router.delete('/sessions/:id', chatController.deleteSession);

module.exports = router;
