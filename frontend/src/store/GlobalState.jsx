import React, { createContext, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api.js';
import mockAnalysis from './mockAnalysis.js';

const GlobalStateContext = createContext(null);

export function GlobalStateProvider({ children }) {
  const [tableRows, setTableRows] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUploadName, setLastUploadName] = useState(null);
  const [downloadBlob, setDownloadBlob] = useState(null);
  const [downloadName, setDownloadName] = useState(null);
  const [analysis] = useState(mockAnalysis);

  const uploadDocument = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const { blob, filename } = await api.uploadDocument(file);
      const parsed = await api.parseExcelBlob(blob);
      setTableRows(parsed.rows);
      setTableColumns(parsed.columns);
      setDownloadBlob(blob);
      setDownloadName(filename || `${file.name.split('.')[0]}_processed.xlsx`);
      setLastUploadName(file.name);
      return parsed;
    } catch (err) {
      setError(err.message || 'Не удалось обработать файл');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadExport = async () => {
    if (!downloadBlob) {
      setError('Нет файла для выгрузки');
      return;
    }

    const url = window.URL.createObjectURL(downloadBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadName || 'processed.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const value = useMemo(
    () => ({
      tableRows,
      tableColumns,
      downloadName,
      error,
      loading,
      lastUploadName,
      uploadDocument,
      downloadExport,
      analysis,
    }),
    [analysis, downloadName, error, lastUploadName, loading, tableColumns, tableRows]
  );

  return <GlobalStateContext.Provider value={value}>{children}</GlobalStateContext.Provider>;
}

GlobalStateProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useGlobalState() {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState должен вызываться внутри GlobalStateProvider');
  }
  return context;
}
