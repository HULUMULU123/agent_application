import React from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useGlobalState } from '../../store/GlobalState.jsx';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

const RISK_LEVELS = [
  { key: 'высокий', label: 'Высокий риск', color: '#eb5757' },
  { key: 'средний', label: 'Средний риск', color: '#ffc857' },
  { key: 'низкий', label: 'Низкий риск', color: '#55bb9b' },
];

const RISK_FIELD_CANDIDATES = ['risk_level', 'risk', 'уровень риска', 'уровень_риска', 'риск', 'risk level'];
const AMOUNT_FIELD_CANDIDATES = ['amount', 'сумма', 'объем', 'объём', 'total_amount', 'transaction_amount', 'value', 'sum'];

function normalizeRiskLevel(rawRisk) {
  const value = (rawRisk ?? '').toString().trim().toLowerCase();
  if (!value) return null;
  if (['high', 'высокий', 'высокий риск'].includes(value)) return 'высокий';
  if (['medium', 'средний', 'средний риск'].includes(value)) return 'средний';
  if (['low', 'низкий', 'низкий риск'].includes(value)) return 'низкий';
  if (value.includes('high') || value.includes('высок') || value.includes('крас')) return 'высокий';
  if (value.includes('med') || value.includes('сред') || value.includes('жёлт') || value.includes('желт')) return 'средний';
  if (value.includes('low') || value.includes('низк') || value.includes('зел')) return 'низкий';
  return null;
}

function parseAmountToNumber(rawAmount) {
  if (typeof rawAmount === 'number' && Number.isFinite(rawAmount)) {
    return rawAmount;
  }

  if (typeof rawAmount !== 'string') {
    return 0;
  }

  const normalized = rawAmount
    .replace(/\s+/g, '')
    .replace(/,/g, '.')
    .replace(/[^\d.-]/g, '');

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatRub(n) {
  return `${new Intl.NumberFormat('ru-RU').format(n)} ₽`;
}

function getRiskFromRow(row) {
  if (!row || typeof row !== 'object') return null;

  for (const key of RISK_FIELD_CANDIDATES) {
    const normalized = normalizeRiskLevel(row[key]);
    if (normalized) return normalized;
  }

  const fallbackKey = Object.keys(row).find((key) => {
    const k = key.toLowerCase();
    return k.includes('risk') || k.includes('риск');
  });

  return normalizeRiskLevel(row[fallbackKey]);
}

function getAmountFromRow(row) {
  if (!row || typeof row !== 'object') return 0;

  for (const key of AMOUNT_FIELD_CANDIDATES) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return parseAmountToNumber(row[key]);
    }
  }

  const fallbackKey = Object.keys(row).find((key) => {
    const k = key.toLowerCase();
    return k.includes('amount') || k.includes('sum') || k.includes('сум');
  });

  return parseAmountToNumber(row[fallbackKey]);
}

const riskClassRules = {
  'risk-row-high': ({ data }) => getRiskFromRow(data) === 'высокий',
  'risk-row-medium': ({ data }) => getRiskFromRow(data) === 'средний',
  'risk-row-low': ({ data }) => getRiskFromRow(data) === 'низкий',
};

export default function StepTransactions({ rows, onBack }) {
  const { tableColumns, downloadExport, downloadName } = useGlobalState();
  const { radarData, pieData, totalAmount, totalOperations } = React.useMemo(() => {
    const dataRows = Array.isArray(rows) ? rows : [];
    const aggregate = RISK_LEVELS.reduce((acc, level) => {
      acc[level.key] = { amount: 0, count: 0 };
      return acc;
    }, {});

    dataRows.forEach((row) => {
      const risk = getRiskFromRow(row);
      if (!risk) return;
      const amount = getAmountFromRow(row);
      aggregate[risk].amount += amount;
      aggregate[risk].count += 1;
    });

    const radarData = RISK_LEVELS.map((level) => ({
      key: level.key,
      label: level.label,
      amount: aggregate[level.key].amount,
      color: level.color,
    }));

    const pieData = RISK_LEVELS.map((level) => ({
      name: level.label,
      value: aggregate[level.key].count,
      color: level.color,
    }));

    const totalAmount = radarData.reduce((acc, item) => acc + item.amount, 0);
    const totalOperations = pieData.reduce((acc, item) => acc + item.value, 0);

    return { radarData, pieData, totalAmount, totalOperations };
  }, [rows]);

  const hasData = totalOperations > 0;
  const maxAmount = Math.max(...radarData.map((item) => item.amount), 1);

  return (
    <div className="grid-wrapper">
      <div className="page-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: 12 }}>
          <div>
            <p className="helper-text" style={{ marginBottom: 4 }}>
              Убедитесь, что данные распознаны корректно перед выгрузкой.
            </p>
            <h3 className="section-title">Анализ транзакций</h3>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {/* <button className="secondary-button" type="button" onClick={onBack}>
              Назад
            </button> */}
            <button className="primary-button" type="button" onClick={downloadExport} disabled={!rows?.length}>
              Скачать {downloadName || 'Excel'}
            </button>
          </div>
        </div>
        {hasData && (
          <>
            <div className="summary-bar" role="status" aria-live="polite">
              <span className="summary-dot" aria-hidden>•</span>
              <span>Операций в выборке: {totalOperations}</span>
              <span className="summary-dot" aria-hidden>•</span>
              <span>Общий объем: {formatRub(totalAmount)}</span>
            </div>

            <div className="dashboard-grid" style={{ marginTop: 6 }}>
              <div className="metric-card">
                <span className="metric-label">Сумма операций по уровню риска</span>
                <div className="chart-shell" style={{ minHeight: 360 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="80%" margin={{ top: 12, right: 24, bottom: 12, left: 24 }}>
                      <defs>
                        <linearGradient id="riskRadarFill" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#55bb9b" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#55bb9b" stopOpacity={0.35} />
                        </linearGradient>
                      </defs>
                      <PolarGrid stroke="rgba(85, 187, 155, 0.18)" />
                      <PolarAngleAxis
                        dataKey="label"
                        tick={({ payload, x, y, textAnchor }) => {
                          const riskColor = RISK_LEVELS.find((level) => level.label === payload.value)?.color;
                          return (
                            <text x={x} y={y} textAnchor={textAnchor} fill={riskColor || '#2f3a45'} fontSize={12}>
                              {payload.value}
                            </text>
                          );
                        }}
                      />
                      <PolarRadiusAxis
                        tick={{ fontSize: 11, fill: '#536471' }}
                        tickFormatter={(value) => {
                          if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} млн`;
                          if (value >= 1_000) return `${Math.round(value / 1000)} тыс`;
                          return `${Math.round(value)} ₽`;
                        }}
                        domain={[0, maxAmount]}
                      />
                      <Radar
                        name="Сумма операций"
                        dataKey="amount"
                        stroke="#55bb9b"
                        strokeWidth={2}
                        fill="url(#riskRadarFill)"
                        fillOpacity={0.7}
                        dot={({ cx, cy, index }) => (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={5}
                            fill={radarData[index]?.color || '#55bb9b'}
                            stroke="#ffffff"
                            strokeWidth={1.5}
                          />
                        )}
                      />
                      <Tooltip
                        formatter={(value) => formatRub(value)}
                        labelFormatter={(label) => label}
                        cursor={{ stroke: 'rgba(85, 187, 155, 0.2)', strokeWidth: 1 }}
                      />
                      <Legend iconType="circle" formatter={(value) => `Сумма по риску`} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="helper-text" style={{ margin: 0, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {radarData.map((item) => (
                    <span key={item.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span
                        aria-hidden
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: item.color,
                          boxShadow: `0 0 0 4px ${item.color}22`,
                        }}
                      />
                      <span>
                        {item.label}: <b>{formatRub(item.amount)}</b>
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="metric-card">
                <span className="metric-label">Количество операций по риску</span>
                <div className="chart-shell">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={78}
                        paddingAngle={6}
                        cornerRadius={10}
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} stroke="#ffffff" strokeWidth={1.5} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} операций`} />
                      <Legend
                        iconType="circle"
                        formatter={(value) => value}
                        wrapperStyle={{ fontSize: 12, color: '#2f3a45' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="helper-text" style={{ margin: 0, display: 'grid', gap: 6 }}>
                  {pieData.map((item) => (
                    <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          aria-hidden
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: item.color,
                            boxShadow: `0 0 0 4px ${item.color}22`,
                          }}
                        />
                        {item.name}
                      </span>
                      <b>{item.value} операций</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
        <div className="ag-theme-quartz" style={{ width: '100%', height: 480, marginTop: 12 }}>
          {rows?.length ? (
            <AgGridReact
              rowData={rows}
              columnDefs={tableColumns}
              rowHeight={44}
              headerHeight={48}
              pagination
              paginationPageSize={15}
              animateRows
              suppressMenuHide={false}
              rowClassRules={riskClassRules}
              defaultColDef={{ filter: true, sortable: true, resizable: true }}
            />
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#536471' }}>
              Таблица появится сразу после загрузки файла.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

StepTransactions.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  onBack: PropTypes.func,
};

StepTransactions.defaultProps = {
  onBack: () => {},
};
