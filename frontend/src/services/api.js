const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

let xlsxLoader;

async function loadXlsx() {
  if (!xlsxLoader) {
    xlsxLoader = import('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm');
  }
  return xlsxLoader;
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/process-excel`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Не удалось отправить файл');
  }

  const contentDisposition = response.headers.get('content-disposition') || '';
  const [, filenamePart] = contentDisposition.split('filename=');
  const filename = filenamePart?.replaceAll('"', '')?.trim();
  const blob = await response.blob();

  return { blob, filename };
}

export async function parseExcelBlob(blob) {
  const XLSX = await loadXlsx();
  const buffer = await blob.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    return { rows: [], columns: [] };
  }

  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  const firstRow = rows[0] || {};
  const columns = Object.keys(firstRow).map((key) => ({
    field: key,
    headerName: key,
    filter: true,
    sortable: true,
    resizable: true,
  }));

  return { rows, columns };
}

export default {
  uploadDocument,
  parseExcelBlob,
};
