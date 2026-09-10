const express = require('express');
const { getAuditLogs, verifyAuditLogs } = require('../controllers/audit.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/verify', verifyToken, verifyAuditLogs);
router.get('/', verifyToken, getAuditLogs);

module.exports = router;
