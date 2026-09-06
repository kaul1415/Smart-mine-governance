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

async function getReports(contractorId) {
  if (USE_MOCKS) return mockDelay(reports.filter((r) => r.contractorId === contractorId).sort((a, b) => new Date(b.date) - new Date(a.date)));
  return apiClient.get(`/contractors/${contractorId}/reports`);
}

async function submitReport(contractorId, payload) {
  if (USE_MOCKS) {
    const newReport = { id: `CR-${500 + reports.length + 1}`, contractorId, status: 'Submitted', date: new Date().toISOString(), ...payload };
    reports = [newReport, ...reports];
    return mockDelay(newReport, 500);
  }
  return apiClient.post(`/contractors/${contractorId}/reports`, payload);
}

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
  submitReport,
  getAttendance,
  recordAttendance,
  getSafetyRequirements,
  getDocuments,
  uploadDocument,
  getRiskNotifications,
  getPerformance,
};
