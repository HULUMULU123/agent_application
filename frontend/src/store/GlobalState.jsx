import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api.js';

const fallbackDocuments = [
  {
    id: 'statement_november.pdf',
    display_name: 'statement_november.pdf',
    kind: 'pdf',
    status: 'готово',
    source: 'Веб-интерфейс',
    uploaded_at: '2024-11-12T09:12:00Z',
    detected_columns: 11,
    detected_rows: 186,
    preview_notes: 'Сгенерировано для предпросмотра интерфейса.',
  },
  {
    id: 'counterparty_registry.csv',
    display_name: 'counterparty_registry.csv',
    kind: 'csv',
    status: 'анализируется',
    source: 'API',
    uploaded_at: '2024-11-11T18:40:00Z',
    detected_columns: 9,
    detected_rows: 242,
    preview_notes: 'Имитация активного задания.',
  },
  {
    id: 'statement_october.xlsx',
    display_name: 'statement_october.xlsx',
    kind: 'excel',
    status: 'архив',
    source: 'Архив',
    uploaded_at: '2024-11-05T10:28:00Z',
    detected_columns: 8,
    detected_rows: 96,
    preview_notes: 'Архивная выгрузка.',
  },
];

const fallbackAnalysis = {
  cashflow: [
    { month: 'Июль', inFlow: 12.4, outFlow: 9.1 },
    { month: 'Август', inFlow: 13.8, outFlow: 11.2 },
    { month: 'Сентябрь', inFlow: 15.6, outFlow: 12.5 },
    { month: 'Октябрь', inFlow: 18.9, outFlow: 22.7 },
    { month: 'Ноябрь', inFlow: 21.4, outFlow: 16.2 },
  ],
  category_split: [
    { category: 'Зарплатные проекты', value: 6.4 },
    { category: 'Подрядчики', value: 4.8 },
    { category: 'Налоги', value: 3.1 },
    { category: 'Операционные расходы', value: 2.6 },
    { category: 'Инвестиции', value: 1.9 },
  ],
  balance_projection: [
    { quarter: 'Q1', base: 42, stress: 35 },
    { quarter: 'Q2', base: 48, stress: 38 },
    { quarter: 'Q3', base: 54, stress: 43 },
    { quarter: 'Q4', base: 61, stress: 46 },
  ],
  activity_heatmap: [
    { day: 'Пн', inflow: 10, outflow: 6 },
    { day: 'Вт', inflow: 12, outflow: 7 },
    { day: 'Ср', inflow: 9, outflow: 4 },
    { day: 'Чт', inflow: 14, outflow: 8 },
    { day: 'Пт', inflow: 16, outflow: 9 },
    { day: 'Сб', inflow: 8, outflow: 6 },
    { day: 'Вс', inflow: 7, outflow: 5 },
  ],
  control_dates: [
    { title: 'Контроль ДДС', date: '14.11.2024', owner: 'Финансы' },
    { title: 'Повторная сверка', date: '17.11.2024', owner: 'СБ' },
    { title: 'Юридический отчет', date: '20.11.2024', owner: 'Юристы' },
  ],
  transactions: [],
  scores: [],
  signals: [
    {
      title: 'Проверить лимиты контрагентов',
      description: 'Объемы выросли на 18% неделя к неделе.',
      provider: 'Внутренний скоринг',
    },
    {
      title: 'Аномальные назначения платежей',
      description: 'Совпадения по шаблону назначений у 2 новых партнеров.',
      provider: 'ML пайплайн',
    },
  ],
};

const GlobalStateContext = createContext(null);

export function GlobalStateProvider({ children }) {
  const [documents, setDocuments] = useState(fallbackDocuments);
  const [analysis, setAnalysis] = useState(fallbackAnalysis);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUploadName, setLastUploadName] = useState(null);

  const refreshDocuments = async () => {
    try {
      const data = await api.fetchDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить документы');
      setDocuments(fallbackDocuments);
    }
  };

  const refreshAnalysis = async () => {
    try {
      const result = await api.fetchAnalysisSummary();
      setAnalysis(result.payload || result);
    } catch (err) {
      setError(err.message || 'Не удалось получить аналитику');
      setAnalysis(fallbackAnalysis);
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
        setAnalysis(data.analysis || data.payload);
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
