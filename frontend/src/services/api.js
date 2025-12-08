import { buildMockUpload, mockAnalysis, mockDocuments, mockExportCsv } from './mockData.js';

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

export async function fetchDocuments() {
  return clone(mockDocuments);
}

export async function uploadDocument(file) {
  const document = buildMockUpload(file);
  return {
    document,
    analysis: mockAnalysis,
  };
}

export async function fetchAnalysisSummary() {
  return clone(mockAnalysis);
}

export async function downloadExport() {
  const csv = mockExportCsv();
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

export default {
  fetchDocuments,
  uploadDocument,
  fetchAnalysisSummary,
  downloadExport,
};
