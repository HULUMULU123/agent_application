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
} from 'recharts';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

const columnDefs = [
  { headerName: 'Дата', field: 'date', minWidth: 120 },
  { headerName: 'Время', field: 'time', minWidth: 110 },
  { headerName: 'Документ', field: 'document', minWidth: 140 },
  { headerName: 'Тип', field: 'type', minWidth: 110 },
  { headerName: 'Категория', field: 'category', minWidth: 130 },
  { headerName: 'Контрагент', field: 'counterparty', minWidth: 160 },
  { headerName: 'ИНН', field: 'inn', minWidth: 130 },
  { headerName: 'КПП', field: 'kpp', minWidth: 130 },
  { headerName: 'Назначение', field: 'purpose', minWidth: 200 },
  { headerName: 'Сумма', field: 'amount', minWidth: 130 },
  { headerName: 'Валюта', field: 'currency', minWidth: 110 },
  { headerName: 'Баланс', field: 'balance', minWidth: 140 },
  { headerName: 'Статус', field: 'status', minWidth: 120 },
  { headerName: 'Канал', field: 'channel', minWidth: 120 },
  { headerName: 'Тег', field: 'tag', minWidth: 110 },
];

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

export default function StepTransactions() {
  const rowData = useMemo(() => {
    return Array.from({ length: 30 }).map((_, index) => {
      const amount = 5000 + Math.random() * 95000;
      const balance = 100000 + Math.random() * 250000;
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
        amount: formatNumber(amount),
        currency: 'RUB',
        balance: formatNumber(balance),
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
      const rawAmount = parseFloat(row.amount.replace(/\s/g, '').replace(',', '.'));
      const bucketIndex = buckets.findIndex((bucket) => rawAmount >= bucket.min && rawAmount < bucket.max);
      if (bucketIndex >= 0) {
        dataset[bucketIndex].transactions += 1;
      }
    });

    return dataset.map((item) => ({ amountRange: item.label, transactions: item.transactions }));
  }, [rowData]);

  return (
    <div className="grid-wrapper">
      <div className="page-card">
        <h3 className="section-title">Таблица транзакций</h3>
        <div className="ag-theme-quartz" style={{ width: '100%', height: 420 }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            rowHeight={48}
            headerHeight={56}
            suppressMenuHide
            pagination
            paginationPageSize={15}
          />
        </div>
      </div>
      <div className="chart-card">
        <h3>Распределение сумм транзакций</h3>
        <ResponsiveContainer width="100%" height={220}>
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
  );
}
