import React from 'react';

const legalOperations = [
  {
    id: 1,
    amount: '18 000 000 ₽',
    risk: 'низкий',
  },
  {
    id: 2,
    amount: '6 500 000 ₽',
    risk: 'низкий',
  },
  {
    id: 3,
    amount: '4 750 000 ₽',
    risk: 'низкий',
  },
  {
    id: 4,
    amount: '860 000 ₽',
    risk: 'низкий',
  },
  {
    id: 5,
    amount: '2 950 000 ₽',
    risk: 'средний',
  },
  {
    id: 6,
    amount: '1 820 000 ₽',
    risk: 'средний',
  },
  {
    id: 7,
    amount: '2 230 000 ₽',
    risk: 'средний',
  },
  {
    id: 8,
    amount: '3 100 000 ₽',
    risk: 'высокий',
  },
  {
    id: 9,
    amount: '1 350 000 ₽',
    risk: 'высокий',
  },
];

const riskClassMap = {
  низкий: 'risk-low',
  средний: 'risk-medium',
  высокий: 'risk-high',
};

// Порядок сортировки по риску: высокий → средний → низкий
const riskOrder = { высокий: 3, средний: 2, низкий: 1 };

function parseAmountToNumber(rubString) {
  // Оставляем только цифры; считаем сумму в рублях (без копеек)
  const digits = (rubString || '').replace(/[^\d]/g, '');
  return Number(digits || 0);
}

function formatRub(n) {
  return new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
}

function toCSV(rows) {
  const headers = [
    'Риск',
    'Количество операций',
    'Общая сумма',
  ];
  const escape = (v) => {
    const s = String(v ?? '');
    // экранирование для CSV
    if (/[",;\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [
    headers.join(';'),
    ...rows.map((r) =>
      [
        r.risk,
        r.operationCount,
        formatRub(r.totalAmount),
      ].map(escape).join(';')
    ),
  ];
  return lines.join('\n');
}

export default function StepLegal() {
  const { riskRows, totalAmount, totalOperations } = React.useMemo(() => {
    const grouped = legalOperations.reduce(
      (acc, operation) => {
        const risk = (operation.risk || '').toLowerCase();
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
  }, []);

  const handleDownload = () => {
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

  return (
    <div className="page-card">
      <div className="section-header">
        <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
        <h3 className="section-title">Юридический анализ &amp; отчет</h3>
        <button
          type="button"
          className="download-btn"
          onClick={handleDownload}
          aria-label="Скачать полную таблицу"
          style={{border: 'none', background: '#d1d1d1', borderRadius:'7px', padding: '7px 10px', fontSize: '10px'}}
        >
          Скачать таблицу
        </button>
        </div>
      </div>

      <p className="helper-text">
        Автоматический комплаенс анализ выделяет обязательства и риски, готовя базу для отчета
        службе безопасности и юридическому департаменту.
      </p>

      <div className="summary-bar" role="status" aria-live="polite">
        <span className="summary-dot" aria-hidden>•</span>
        <span>Всего операций: {totalOperations}</span>
        <span className="summary-dot" aria-hidden>•</span>
        <span>Общий объем: {formatRub(totalAmount)}</span>
      </div>

      <div className="risk-summary-grid">
        {riskRows.map((row) => (
          <div key={row.risk} className="risk-summary-card">
            <div className="risk-summary-label">{row.risk}</div>
            <div className="risk-summary-value">{row.operationCount} операции</div>
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
            <tr key={row.risk}>
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

      {/* 
        Пример минимальных стилей (если у вас уже есть дизайн-система, можно удалить этот блок и
        использовать ваши классы):
        .section-header { display:flex; align-items:center; justify-content:space-between; gap:1rem; }
        .download-btn { padding:8px 14px; border-radius:10px; border:0; cursor:pointer; font-weight:600; }
        .download-btn { background:#0b5fff; color:#fff; box-shadow:0 4px 12px rgba(11,95,255,.25); }
        .download-btn:hover { filter:brightness(.95); }
        .summary-bar { margin:12px 0 16px; padding:10px 12px; border-radius:12px; background:#f5f7fb; display:flex; align-items:center; gap:8px; font-size:14px; }
        .summary-dot { opacity:.6; }
        .risk-badge { padding:4px 8px; border-radius:999px; font-size:12px; font-weight:600; text-transform:capitalize; }
        .risk-low { background:#e9f7ef; color:#1e7e34; }
        .risk-medium { background:#fff4e5; color:#b45f06; }
        .risk-high { background:#fdecea; color:#b71c1c; }
      */}
    </div>
  );
}
