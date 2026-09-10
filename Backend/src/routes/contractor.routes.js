const express = require('express');
const {
  getContractors,
  getContractorById,
  getProjects,
  getReports,
  uploadReport,
  processReport,
  finalizeReport,
  getAttendance,
  recordAttendance,
  getSafetyRequirements,
  getDocuments,
  uploadDocument,
  getRiskNotifications,
  getPerformance,
} = require('../controllers/contractor.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', verifyToken, getContractors);
router.post('/reports', verifyToken, uploadReport);
router.post('/reports/:id/process', verifyToken, processReport);
router.patch('/reports/:id', verifyToken, finalizeReport);

router.get('/:id', verifyToken, getContractorById);
router.get('/:id/projects', verifyToken, getProjects);
router.get('/:id/reports', verifyToken, getReports);
router.get('/:id/attendance', verifyToken, getAttendance);
router.post('/:id/attendance', verifyToken, recordAttendance);
router.get('/:id/safety-requirements', verifyToken, getSafetyRequirements);
router.get('/:id/documents', verifyToken, getDocuments);
router.post('/:id/documents', verifyToken, uploadDocument);
router.get('/:id/risk-notifications', verifyToken, getRiskNotifications);
router.get('/:id/performance', verifyToken, getPerformance);

module.exports = router;
