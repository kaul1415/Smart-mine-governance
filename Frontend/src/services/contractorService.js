import { apiClient, USE_MOCKS, mockDelay } from './api.js';
import {
  mockContractors,
  mockContractorProjects,
  mockContractorReports,
  mockAttendance,
  mockSafetyRequirements,
  mockContractorDocuments,
  mockRiskNotifications,
  mockContractorPerformance,
} from '../data/mockData.js';

let contractors = [...mockContractors];
let reports = [...mockContractorReports];
let attendance = [...mockAttendance];
let documents = [...mockContractorDocuments];

async function getContractors() {
  if (USE_MOCKS) return mockDelay(contractors);
  return apiClient.get('/contractors'); // GET /contractors
}

async function getContractorById(id) {
  if (USE_MOCKS) return mockDelay(contractors.find((c) => c.id === id) ?? null);
  return apiClient.get(`/contractors/${id}`); // GET /contractors/:id
}

async function getProjects(contractorId) {
  if (USE_MOCKS) return mockDelay(mockContractorProjects.filter((p) => p.contractorId === contractorId));
  return apiClient.get(`/contractors/${contractorId}/projects`);
}

// ---- Contractor Reports (document upload + OCR) -------------------
//
// Distinct from getDocuments/uploadDocument below (general Contractor
// → Documents storage). A report always starts from an uploaded
// document; there is no free-text report editor. The workflow is:
//   uploadReport()  -> record created, processingStatus "Uploaded"
//   processReport() -> mock stand-in for the backend/ML OCR pipeline;
//                       sets processingStatus "OCR Completed" +
//                       extractedData. Real mode never calls this —
//                       the backend pushes the processed result.
//   finalizeReport() -> reportStatus "Submitted", report appears in
//                        the contractor's report history.

async function getReports(contractorId) {
  if (USE_MOCKS) return mockDelay(reports.filter((r) => r.contractorId === contractorId).sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate)));
  return apiClient.get(`/contractors/${contractorId}/reports`); // GET /api/contractor/reports
}

async function uploadReport(contractorId, payload) {
  if (USE_MOCKS) {
    const newReport = {
      id: `CR-${500 + reports.length + 1}`,
      contractorId,
      processingStatus: 'Uploaded',
      reportStatus: 'Draft',
      submittedDate: null,
      extractedData: null,
      ...payload,
    };
    reports = [newReport, ...reports];
    return mockDelay(newReport, 500);
  }
  return apiClient.post('/contractors/reports', payload); // POST /api/contractor/reports — metadata + document
}

// Mock-only stand-in for the backend/ML OCR pipeline finishing.
function buildMockExtraction(report, contractorName) {
  return {
    contractor: contractorName,
    project: report.projectName,
    reportDate: new Date(report.reportDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    workProgress: 'Extracted from the uploaded document by the OCR/AI service — sample text for prototype demonstration.',
    safetyObservations: 'No high-severity safety observations detected in this document.',
    complianceIssues: 'No compliance issues detected in this document.',
    correctiveActions: 'None suggested by the classification service.',
  };
}

async function processReport(reportId, contractorName) {
  if (USE_MOCKS) {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return mockDelay(null, 200);
    const extractedData = buildMockExtraction(report, contractorName);
    reports = reports.map((r) => (r.id === reportId ? { ...r, processingStatus: 'OCR Completed', extractedData } : r));
    return mockDelay(reports.find((r) => r.id === reportId), 1200);
  }
  return apiClient.post(`/contractors/reports/${reportId}/process`, {}); // POST /api/contractor/reports/:id/process — backend/ML OCR
}

async function finalizeReport(reportId) {
  if (USE_MOCKS) {
    reports = reports.map((r) => (r.id === reportId ? { ...r, reportStatus: 'Submitted', submittedDate: new Date().toISOString() } : r));
    return mockDelay(reports.find((r) => r.id === reportId), 400);
  }
  return apiClient.patch(`/contractors/reports/${reportId}`, { reportStatus: 'Submitted' });
}

// ---------------------------------------------------------------------

async function getAttendance(contractorId) {
  if (USE_MOCKS) return mockDelay(attendance.filter((a) => a.contractorId === contractorId).sort((a, b) => new Date(b.date) - new Date(a.date)));
  return apiClient.get(`/contractors/${contractorId}/attendance`);
}

async function recordAttendance(contractorId, payload) {
  if (USE_MOCKS) {
    const newEntry = { id: `ATT-${Date.now()}`, contractorId, ...payload };
    attendance = [newEntry, ...attendance];
    return mockDelay(newEntry, 400);
  }
  return apiClient.post(`/contractors/${contractorId}/attendance`, payload);
}

async function getSafetyRequirements(contractorId) {
  if (USE_MOCKS) return mockDelay(mockSafetyRequirements.filter((s) => s.contractorId === contractorId));
  return apiClient.get(`/contractors/${contractorId}/safety-requirements`);
}

// General document storage — kept separate from Contractor Reports
// above (section 5's "important separation").
async function getDocuments(contractorId) {
  if (USE_MOCKS) return mockDelay(documents.filter((d) => d.contractorId === contractorId));
  return apiClient.get(`/contractors/${contractorId}/documents`);
}

async function uploadDocument(contractorId, payload) {
  if (USE_MOCKS) {
    const newDoc = { id: `CD-${Date.now()}`, contractorId, uploadedDate: new Date().toISOString(), ...payload };
    documents = [newDoc, ...documents];
    return mockDelay(newDoc, 500);
  }
  return apiClient.post(`/contractors/${contractorId}/documents`, payload); // POST /documents
}

async function getRiskNotifications(contractorId) {
  if (USE_MOCKS) return mockDelay(mockRiskNotifications.filter((n) => n.contractorId === contractorId).sort((a, b) => new Date(b.date) - new Date(a.date)));
  return apiClient.get(`/contractors/${contractorId}/risk-notifications`);
}

async function getPerformance(contractorId) {
  if (USE_MOCKS) return mockDelay(mockContractorPerformance[contractorId] ?? null);
  return apiClient.get(`/contractors/${contractorId}/performance`);
}

export const contractorService = {
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
};
