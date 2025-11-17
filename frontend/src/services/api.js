const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

async function handleJsonResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.detail || `Ошибка ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export async function fetchDocuments() {
  const response = await fetch(`${API_BASE}/uploads/`);
  return handleJsonResponse(response);
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/uploads/`, {
    method: 'POST',
    body: formData,
  });

  return handleJsonResponse(response);
}

export async function fetchAnalysisSummary() {
  const response = await fetch(`${API_BASE}/analysis/summary/`);
  return handleJsonResponse(response);
}

export async function downloadExport(format = 'csv') {
  const endpoint = format === 'excel' ? 'exports/excel/' : 'exports/csv/';
  const response = await fetch(`${API_BASE}/${endpoint}`);
  if (!response.ok) {
    throw new Error(`Ошибка выгрузки (${response.status})`);
  }
  return response.blob();
}

export default {
  fetchDocuments,
  uploadDocument,
  fetchAnalysisSummary,
  downloadExport,
};
