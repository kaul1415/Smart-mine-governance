const express = require('express');
const { syncItem } = require('../controllers/sync.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', verifyToken, syncItem);

module.exports = router;
