import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api.js';

const GlobalStateContext = createContext(null);

export function GlobalStateProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [analysis, setAnalysis] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUploadName, setLastUploadName] = useState(null);

  const refreshDocuments = async () => {
    try {
      const data = await api.fetchDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить документы');
    }
  };

  const refreshAnalysis = async () => {
    try {
      const result = await api.fetchAnalysisSummary();
      const payload = result.payload || result;
      setAnalysis({
        ...payload,
        history: result.history || payload.history || [],
        statistics: result.statistics || payload.statistics || null,
      });
    } catch (err) {
      setError(err.message || 'Не удалось получить аналитику');
    }
  };

  useEffect(() => {
    refreshDocuments();
    refreshAnalysis();
  }, []);

  const uploadDocument = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.uploadDocument(file);
      const doc = data.document || data;
      setDocuments((prev) => [doc, ...prev.filter((item) => item.id !== doc.id)]);
      setLastUploadName(doc.display_name || file.name);
      if (data.analysis || data.payload) {
        const payload = data.analysis || data.payload;
        setAnalysis({
          ...payload,
          history: data.history || payload.history || [],
          statistics: data.statistics || payload.statistics || null,
        });
      }
      return data;
    } catch (err) {
      setError(err.message || 'Не удалось отправить файл на бэкенд');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadExport = async (format = 'csv') => {
    try {
      const blob = await api.downloadExport(format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = format === 'excel' ? 'agent-transactions.xlsx' : 'agent-transactions.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Не удалось выгрузить файл');
    }
  };

  const value = useMemo(
    () => ({
      documents,
      analysis,
      error,
      loading,
      lastUploadName,
      uploadDocument,
      refreshDocuments,
      refreshAnalysis,
      downloadExport,
    }),
    [analysis, documents, error, lastUploadName, loading]
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
