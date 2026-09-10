const express = require('express');
const { generateReport } = require('../controllers/reports.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', verifyToken, generateReport);

module.exports = router;
