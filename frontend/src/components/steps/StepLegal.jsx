import React from 'react';
import { useGlobalState } from '../../store/GlobalState.jsx';

const riskClassMap = {
  низкий: 'risk-low',
  средний: 'risk-medium',
  высокий: 'risk-high',
};

const riskRowClassMap = {
  низкий: 'risk-row-low',
  средний: 'risk-row-medium',
  высокий: 'risk-row-high',
};

// Порядок сортировки по риску: высокий → средний → низкий
const riskOrder = { высокий: 3, средний: 2, низкий: 1 };

function normalizeRiskLevel(rawRisk) {
  const value = (rawRisk ?? '').toString().trim().toLowerCase();
  if (!value) return null;
  if (['high', 'высокий', 'высокий риск'].includes(value)) return 'высокий';
  if (['medium', 'средний', 'средний риск'].includes(value)) return 'средний';
  if (['low', 'низкий', 'низкий риск'].includes(value)) return 'низкий';
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

function toCSV(rows) {
  const headers = ['Риск', 'Количество операций', 'Общая сумма'];
  const escape = (v) => {
    const s = String(v ?? '');
    if (/[,";\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [
    headers.join(';'),
    ...rows.map((r) => [r.risk, r.operationCount, formatRub(r.totalAmount)].map(escape).join(';')),
  ];
  return lines.join('\n');
}

export default function StepLegal() {
  const { tableRows } = useGlobalState();

  const { riskRows, totalAmount, totalOperations } = React.useMemo(() => {
    const grouped = tableRows.reduce(
      (acc, operation) => {
        const risk = normalizeRiskLevel(operation.risk_level);
        if (!risk) {
          return acc;
        }

        const amount = parseAmountToNumber(operation.amount);

        if (!acc.byRisk[risk]) {
          acc.byRisk[risk] = {
            risk,
            operationCount: 0,
            totalAmount: 0,
          };
        }

        acc.byRisk[risk].operationCount += 1;
        acc.byRisk[risk].totalAmount += amount;
        acc.totalAmount += amount;
        acc.totalOperations += 1;
        return acc;
      },
      { byRisk: {}, totalAmount: 0, totalOperations: 0 }
    );

    const riskRows = Object.values(grouped.byRisk)
      .map((entry) => ({
        ...entry,
        formattedAmount: formatRub(entry.totalAmount),
      }))
      .sort((a, b) => riskOrder[b.risk] - riskOrder[a.risk]);

    return {
      riskRows,
      totalAmount: grouped.totalAmount,
      totalOperations: grouped.totalOperations,
    };
  }, [tableRows]);

  const handleDownload = () => {
    if (!riskRows.length) return;

    const csv = toCSV(riskRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const today = new Date().toISOString().slice(0, 10);
    link.download = `legal_report_${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const hasRiskRows = riskRows.length > 0;

  return (
    <div className="page-card">
      <div className="section-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h3 className="section-title">Юридический анализ &amp; отчет</h3>
          <button
            type="button"
            className="download-btn"
            onClick={handleDownload}
            aria-label="Скачать распределение по рискам"
            style={{ border: 'none', background: '#d1d1d1', borderRadius: '7px', padding: '7px 10px', fontSize: '10px' }}
            disabled={!hasRiskRows}
          >
            Скачать таблицу
          </button>
        </div>
      </div>

      <p className="helper-text">
        Автоматический комплаенс анализ выделяет обязательства и риски по тем операциям, где указан уровень риска (risk_level).
      </p>

      {hasRiskRows ? (
        <>
          <div className="summary-bar" role="status" aria-live="polite">
            <span className="summary-dot" aria-hidden>•</span>
            <span>Всего операций с риском: {totalOperations}</span>
            <span className="summary-dot" aria-hidden>•</span>
            <span>Общий объем: {formatRub(totalAmount)}</span>
          </div>

          <div className="risk-summary-grid">
            {riskRows.map((row) => (
              <div key={row.risk} className="risk-summary-card">
                <div className="risk-summary-label">{row.risk}</div>
                <div className="risk-summary-value">{row.operationCount} операций</div>
                <div className="risk-summary-amount">{row.formattedAmount}</div>
              </div>
            ))}
          </div>

          <table className="risk-table">
            <thead>
              <tr>
                <th>Общая сумма</th>
                <th>Количество операций</th>
                <th>Риск</th>
              </tr>
            </thead>
            <tbody>
              {riskRows.map((row) => (
                <tr key={row.risk} className={riskRowClassMap[row.risk]}>
                  <td>{row.formattedAmount}</td>
                  <td>{row.operationCount}</td>
                  <td>
                    <span className={`risk-badge ${riskClassMap[row.risk]}`}>
                      {row.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div className="empty-state" role="status" aria-live="polite">
          <p className="helper-text" style={{ marginBottom: 8 }}>
            Для раздела нужно загрузить файл с колонками amount и risk_level. Мы подсветим строки и посчитаем сумму по уровням риска.
          </p>
          <p className="helper-text" style={{ margin: 0 }}>После загрузки выписки сюда подтянутся реальные данные — мокапов здесь нет.</p>
        </div>
      )}
    </div>
  );
}
