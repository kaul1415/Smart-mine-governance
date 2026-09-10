const express = require('express');
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', verifyToken, getDashboardStats);

module.exports = router;
