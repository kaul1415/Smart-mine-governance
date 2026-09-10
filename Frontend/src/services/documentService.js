import { API_BASE_URL, apiClient, USE_MOCKS, mockDelay } from './api.js';
import { mockDocuments } from '../data/mockData.js';

let documents = [...mockDocuments];

async function getDocuments() {
  if (USE_MOCKS) return mockDelay([...documents].sort((a, b) => new Date(b.uploadedDate) - new Date(a.uploadedDate)));
  return apiClient.get('/documents'); // GET /documents
}

async function getDocumentById(id) {
  if (USE_MOCKS) return mockDelay(documents.find((d) => d.id === id) ?? null);
  return apiClient.get(`/documents/${id}`); // GET /documents/:id
}

// Uploading only ever creates the record with status "Processing" —
// the actual OCR/AI extraction always happens server-side. In mock
// mode, processDocument() below stands in for that backend step.
async function uploadDocument(payload) {
  if (USE_MOCKS) {
    const newDoc = {
      id: `DOC-${Date.now()}`,
      status: 'Processing',
      uploadedDate: new Date().toISOString(),
      extractedData: null,
      ...payload,
    };
    documents = [newDoc, ...documents];
    return mockDelay(newDoc, 400);
  }
  return apiClient.post('/documents', payload); // POST /documents
}

// Mock-only stand-in for the backend OCR/AI pipeline finishing. Real
// mode never calls this — the backend pushes the processed result,
// this frontend only ever displays it.
async function processDocument(id) {
  if (USE_MOCKS) {
    const extractedData = {
      documentType: 'Field Report',
      mine: documents.find((d) => d.id === id)?.mineName || 'Unknown',
      inspectionDate: new Date().toISOString(),
      inspector: 'Pending Review',
      observations: ['Document processed — no high-severity findings detected by the classification service.'],
      highSeverityFindings: 0,
      suggestedCorrectiveActions: [],
    };
    documents = documents.map((d) => (d.id === id ? { ...d, status: 'Processed', extractedData } : d));
    return mockDelay(documents.find((d) => d.id === id), 1200);
  }
  return apiClient.get(`/documents/${id}`);
}

// OCR is deliberately a real local-service call even while the rest of the
// field-reporting demo uses mock records. This lets a user paste OCR output
// directly into a report before it is queued for sync.
async function extractText(file) {
  const token = localStorage.getItem('minegov_auth_token');
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE_URL}/documents/extract-text`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.detail || 'Unable to extract text from this file.');
  return payload;
}

export const documentService = { getDocuments, getDocumentById, uploadDocument, processDocument, extractText };
