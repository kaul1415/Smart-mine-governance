const express = require('express');
const { getNotices } = require('../controllers/notice.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', verifyToken, getNotices);

module.exports = router;
