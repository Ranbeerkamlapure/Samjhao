import api from './api';

// Document-related data rules and helpers (no UI here)

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

// Check if a selected file is a valid document image
export function validateImageFile(file) {
  if (!file) {
    return { ok: false, error: 'Please choose an image file.' };
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, error: 'Please upload a JPG, PNG or WebP image.' };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: 'File must be 10 MB or smaller.' };
  }

  return { ok: true, error: '' };
}

export function createPreviewUrl(file) {
  return URL.createObjectURL(file);
}

export function revokePreviewUrl(url) {
  if (url) {
    URL.revokeObjectURL(url);
  }
}

// Send the image + language to the backend explain API
export async function explainDocument(file, language) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('language', language);

  // Do not set Content-Type manually — Axios/browser add the multipart boundary
  const response = await api.post('/api/documents/explain', formData);
  return response.data;
}

export async function fetchDocuments() {
  const response = await api.get('/api/documents');
  return response.data.documents || [];
}

export async function fetchDocumentById(id) {
  const response = await api.get(`/api/documents/${id}`);
  return response.data.document;
}

// Turn Axios/network failures into short user-facing messages
export function getExplainErrorMessage(error) {
  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Please try again — analysis can take a few minutes.';
  }

  if (!error.response) {
    return 'Cannot reach the server. Make sure the backend is running on port 5000.';
  }

  const apiMessage = error.response.data?.error;
  if (apiMessage) {
    return apiMessage;
  }

  if (error.response.status >= 500) {
    return 'The server failed to explain this document. Please try again.';
  }

  return 'Failed to explain the document. Please try again.';
}
