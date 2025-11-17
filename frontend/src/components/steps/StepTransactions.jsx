import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useGlobalState } from '../../store/GlobalState.jsx';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

const STATUSES = ['Выполнено', 'Ожидает', 'Отклонено'];
const CHANNELS = ['API', 'Мобильный банк', 'Интернет-банк'];
const CATEGORIES = ['Зарплата', 'Подрядчики', 'Налоги', 'Закупки'];
const TYPES = ['Поступление', 'Списание'];
const TAGS = ['Рутинное', 'Требует внимания', 'Высокий приоритет'];

const formatNumber = (value) =>
  value.toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const defaultColDef = {
  sortable: true,
  resizable: true,
  filter: true, // базово включаем фильтры
  floatingFilter: true, // строка фильтра в хедере
};

const textFilterParams = {
  debounceMs: 200,
  buttons: ['reset'],
};

const setFilterParams = {
  debounceMs: 0,
  suppressSorting: false,
  excelMode: 'windows',
};

const columnDefs = [
  { headerName: 'Дата', field: 'date', minWidth: 120, filter: 'agTextColumnFilter', filterParams: textFilterParams },
  { headerName: 'Время', field: 'time', minWidth: 110, filter: 'agTextColumnFilter', filterParams: textFilterParams },
  { headerName: 'Документ', field: 'document', minWidth: 140, filter: 'agTextColumnFilter', filterParams: textFilterParams },
  { headerName: 'Тип', field: 'type', minWidth: 110, filter: 'agSetColumnFilter', filterParams: { ...setFilterParams, values: TYPES } },
  { headerName: 'Категория', field: 'category', minWidth: 130, filter: 'agSetColumnFilter', filterParams: { ...setFilterParams, values: CATEGORIES } },
  { headerName: 'Контрагент', field: 'counterparty', minWidth: 160, filter: 'agTextColumnFilter', filterParams: textFilterParams },
  { headerName: 'ИНН', field: 'inn', minWidth: 130, filter: 'agTextColumnFilter', filterParams: textFilterParams },
  { headerName: 'КПП', field: 'kpp', minWidth: 130, filter: 'agTextColumnFilter', filterParams: textFilterParams },
  { headerName: 'Назначение', field: 'purpose', minWidth: 200, filter: 'agTextColumnFilter', filterParams: textFilterParams },

  // Числовые колонки: используем raw-значения для фильтра/сортировки и форматтер для отображения
  {
    headerName: 'Сумма',
    field: 'amountRaw',
    minWidth: 130,
    filter: 'agNumberColumnFilter',
    valueGetter: (p) => p.data.amountRaw,
    valueFormatter: (p) => formatNumber(p.value),
  },
  { headerName: 'Валюта', field: 'currency', minWidth: 110, filter: 'agSetColumnFilter', filterParams: { ...setFilterParams, values: ['RUB'] } },
  {
    headerName: 'Баланс',
    field: 'balanceRaw',
    minWidth: 140,
    filter: 'agNumberColumnFilter',
    valueGetter: (p) => p.data.balanceRaw,
    valueFormatter: (p) => formatNumber(p.value),
  },

  { headerName: 'Статус', field: 'status', minWidth: 120, filter: 'agSetColumnFilter', filterParams: { ...setFilterParams, values: STATUSES } },
  { headerName: 'Канал', field: 'channel', minWidth: 120, filter: 'agSetColumnFilter', filterParams: { ...setFilterParams, values: CHANNELS } },
  { headerName: 'Тег', field: 'tag', minWidth: 110, filter: 'agSetColumnFilter', filterParams: { ...setFilterParams, values: TAGS } },
];

export default function StepTransactions() {
  const { analysis, downloadExport } = useGlobalState();

  const rowData = useMemo(() => {
    const transactions = analysis.transactions || [];
    return transactions.map((tx, index) => {
      const amountRaw = Math.abs(tx.amount ?? tx.amountRaw ?? 0);
      const balanceRaw = Math.abs(tx.balance ?? tx.balanceRaw ?? 0);

      return {
        id: tx.id || `tx-${index}`,
        date: tx.date || tx.created_at || tx.createdAt || '—',
        time: tx.time || tx.processed_at || tx.processedAt || '—',
        document: tx.document || 'Документ',
        type: tx.type || (tx.amount >= 0 ? 'Поступление' : 'Списание'),
        category: tx.category || '—',
        counterparty: tx.counterparty || 'Неизвестно',
        inn: tx.inn || '—',
        kpp: tx.kpp || '—',
        purpose: tx.purpose || tx.description || '—',
        amountRaw: amountRaw || 0,
        currency: tx.currency || 'RUB',
        balanceRaw: balanceRaw || amountRaw,
        status: tx.status || (tx.risk === 'высокий' ? 'Отклонено' : 'Выполнено'),
        channel: tx.channel || 'API',
        tag: tx.tag || (tx.risk === 'высокий' ? 'Требует внимания' : 'Рутинное'),
      };
    });
  }, [analysis.transactions]);

  const mlRows = useMemo(() => {
    const transactions = analysis.transactions || [];
    return transactions.map((tx, index) => {
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() - index);
      const absoluteAmount = Math.abs(tx.amount || 0);
      return {
        id: `ml-${index}`,
        date: baseDate.toLocaleDateString('ru-RU'),
        time: baseDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        document: tx.document || 'ML-поток',
        type: absoluteAmount >= 0 ? 'Поступление' : 'Списание',
        category: tx.category || 'ML аналитика',
        counterparty: tx.counterparty || `Контрагент ML-${index + 1}`,
        inn: tx.inn || `77${(4500000 + index * 17).toString().padStart(7, '0')}`,
        kpp: tx.kpp || `77${(5500000 + index * 11).toString().padStart(7, '0')}`,
        purpose: tx.description || 'Сгенерировано пайплайном моделей',
        amountRaw: absoluteAmount || 12000,
        currency: tx.currency || 'RUB',
        balanceRaw: 100000 + absoluteAmount * 2,
        status: tx.risk === 'высокий' ? 'Отклонено' : 'Выполнено',
        channel: 'API',
        tag: tx.risk === 'высокий' ? 'Требует внимания' : 'Рутинное',
      };
    });
  }, [analysis.transactions]);

  const rowData = useMemo(() => [...syntheticRows, ...mlRows], [mlRows, syntheticRows]);

  const distribution = useMemo(() => {
    const buckets = [
      { label: '0 — 10K', min: 0, max: 10000 },
      { label: '10K — 30K', min: 10000, max: 30000 },
      { label: '30K — 50K', min: 30000, max: 50000 },
      { label: '50K — 80K', min: 50000, max: 80000 },
      { label: '80K+', min: 80000, max: Infinity },
    ];

    const dataset = buckets.map((bucket) => ({
      label: bucket.label,
      transactions: 0,
    }));

    rowData.forEach((row) => {
      const rawAmount = row.amountRaw;
      const bucketIndex = buckets.findIndex((bucket) => rawAmount >= bucket.min && rawAmount < bucket.max);
      if (bucketIndex >= 0) {
        dataset[bucketIndex].transactions += 1;
      }
    });

    return dataset.map((item) => ({ amountRange: item.label, transactions: item.transactions }));
  }, [rowData]);

  const activityByHour = useMemo(() => {
    if (analysis.activity_heatmap && analysis.activity_heatmap.length) {
      return analysis.activity_heatmap.map((item) => ({
        hour: item.day,
        inflow: item.inflow,
        outflow: item.outflow,
      }));
    }
    return [];
  }, [analysis.activity_heatmap]);

  return (
    <div className="grid-wrapper">
      <div className="page-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: 12 }}>
          <h3 className="section-title">Таблица транзакций</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => downloadExport('csv')}
              style={{ padding: '7px 10px', background: '#d6d6d6', fontSize: '10px', height: '28px', borderRadius: '7px', color: '#828282', border: 'none' }}
            >
              CSV
            </button>
            <button
              type="button"
              onClick={() => downloadExport('excel')}
              style={{ padding: '7px 10px', background: '#d6d6d6', fontSize: '10px', height: '28px', borderRadius: '7px', color: '#828282', border: 'none' }}
            >
              Excel
            </button>
          </div>
        </div>
        <div className="ag-theme-quartz" style={{ width: '100%', height: 420 }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowHeight={48}
            headerHeight={56}
            suppressMenuHide={false}
            pagination
            paginationPageSize={15}
            animateRows
          />
        </div>
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Суммы транзакций за один день</h3>
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={distribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#55bb9b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#55bb9b" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(85, 187, 155, 0.3)" />
                <XAxis dataKey="amountRange" tick={{ fill: '#536471', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#536471', fontSize: 12 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Area type="monotone" dataKey="transactions" stroke="#55bb9b" fill="url(#areaGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="chart-card">
          <h3>Активность по дням</h3>
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityByHour} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(47, 58, 69, 0.18)" />
                <XAxis dataKey="hour" tick={{ fill: '#536471', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#536471', fontSize: 12 }} />
                <Tooltip formatter={(value) => `${value} операций`} />
                <Legend verticalAlign="top" iconType="circle" height={32} />
                <Line type="monotone" dataKey="inflow" name="Поступления" stroke="#55bb9b" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="outflow" name="Списания" stroke="#2f3a45" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
