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
  filter: true,            // базово включаем фильтры
  floatingFilter: true,    // строка фильтра в хедере
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
  const rowData = useMemo(() => {
    return Array.from({ length: 30 }).map((_, index) => {
      const amountRaw = 5000 + Math.random() * 95000;
      const balanceRaw = 100000 + Math.random() * 250000;
      const minutes = ((index * 7) % 60).toString().padStart(2, '0');
      return {
        id: index + 1,
        date: new Date(2024, 10, (index % 27) + 1).toLocaleDateString('ru-RU'),
        time: `${(8 + (index % 9)).toString().padStart(2, '0')}:${minutes}`,
        document: `DOC-${12000 + index}`,
        type: TYPES[index % TYPES.length],
        category: CATEGORIES[index % CATEGORIES.length],
        counterparty: `Контрагент ${index + 1}`,
        inn: `77${(4500000 + index * 17).toString().padStart(7, '0')}`,
        kpp: `77${(5500000 + index * 11).toString().padStart(7, '0')}`,
        purpose: `Оплата по договору №${3000 + index}`,
        amountRaw,
        currency: 'RUB',
        balanceRaw,
        status: STATUSES[index % STATUSES.length],
        channel: CHANNELS[index % CHANNELS.length],
        tag: TAGS[index % TAGS.length],
      };
    });
  }, []);

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

  const activityByHour = useMemo(
    () => [
      { hour: 'Вт', inflow: 6, outflow: 2 },
      { hour: 'Ср', inflow: 9, outflow: 4 },
      { hour: 'Чт', inflow: 12, outflow: 7 },
      { hour: 'Пт', inflow: 10, outflow: 8 },
      { hour: 'Сб', inflow: 14, outflow: 11 },
      { hour: 'Вс', inflow: 16, outflow: 9 },
      { hour: 'Пн', inflow: 13, outflow: 6 },
      
    ],
    []
  );

  return (
    <div className="grid-wrapper">
      <div className="page-card">
        <div style={{display: 'flex', justifyContent: 'space-between', width:'100%', alignItems: 'center'}}>
          <h3 className="section-title">Таблица транзакций</h3>
          <span style={{padding: '7px 10px', background: '#d6d6d6', fontSize:'8px', height: '25px', alignItems:'center', borderRadius: '7px', color:'#828282'}}>Скачать таблицу</span>
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
                <Legend verticalAlign="top" iconType="circle" height={36} />
                <Line type="monotone" dataKey="inflow" name="Поступления" stroke="#55bb9b" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="outflow" name="Расходные операции" stroke="#2f3a45" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
