const express = require('express');
const { getAuditLogs } = require('../controllers/audit.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', verifyToken, getAuditLogs);

module.exports = router;
