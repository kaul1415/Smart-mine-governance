const express = require('express');
const {
  getRiskScores,
  getRiskForMine,
  getRecurringIssues,
} = require('../controllers/risk.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', verifyToken, getRiskScores);
router.get('/mines/:id', verifyToken, getRiskForMine);
router.get('/recurring-issues', verifyToken, getRecurringIssues);

module.exports = router;
