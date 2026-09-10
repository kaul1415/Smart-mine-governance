const express = require('express');
const { login, logout, me } = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/login', login);
router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, me);

module.exports = router;
