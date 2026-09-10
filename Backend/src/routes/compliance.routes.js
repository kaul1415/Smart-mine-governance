const express = require('express');
const {
  getComplianceRequirements,
  getComplianceRequirementById,
} = require('../controllers/compliance.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', verifyToken, getComplianceRequirements);
router.get('/:id', verifyToken, getComplianceRequirementById);

module.exports = router;
