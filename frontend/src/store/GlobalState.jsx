import React, { createContext, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api.js';
import { mockAnalysis, mockDocuments } from '../services/mockData.js';

const GlobalStateContext = createContext(null);

export function GlobalStateProvider({ children }) {
  const [documents, setDocuments] = useState(mockDocuments);
  const [analysis, setAnalysis] = useState(mockAnalysis);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUploadName, setLastUploadName] = useState(null);

  const refreshDocuments = async () => {
    setDocuments(await api.fetchDocuments());
  };

  const refreshAnalysis = async () => {
    setAnalysis(await api.fetchAnalysisSummary());
  };

  const uploadDocument = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.uploadDocument(file);
      const doc = data.document || data;
      setDocuments((prev) => [doc, ...prev]);
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
      setError(err.message || 'Не удалось обработать файл');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadExport = async () => {
    try {
      const blob = await api.downloadExport();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'agent-transactions.csv';
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
