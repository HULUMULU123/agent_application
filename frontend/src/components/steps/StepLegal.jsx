import React from 'react';

const legalRows = [
  {
    id: 1,
    
    amount: '52 200 000 ₽',
    notes: '122',
    risk: 'низкий',
    more: 'Подробнее'
  },
  {
    id: 2,
    
    amount: '7 000 000 ₽',
    notes: '22',
    risk: 'средний',
    more: 'Подробнее'
  },
  {
    id: 3,
    amount: '4 450 000 ₽',
    notes: '7',
    risk: 'высокий',
    more: 'Подробнее'
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
    'Общая сумма',
    'Количество операций',
    'Риск',
    ''
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
        r.document,
        r.counterparty,
        r.date,
        r.obligation,
        r.amount,
        r.notes,
        r.risk,
      ].map(escape).join(';')
    ),
  ];
  return lines.join('\n');
}

export default function StepLegal() {
  const sortedRows = React.useMemo(
    () =>
      [...legalRows].sort(
        (a, b) => riskOrder[b.risk] - riskOrder[a.risk]
      ),
    []
  );

  const totalCount = sortedRows.length;
  const totalAmount = sortedRows.reduce(
    (acc, r) => acc + parseAmountToNumber(r.amount),
    0
  );

  const handleDownload = () => {
    const csv = toCSV(sortedRows);
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

      

      <table className="risk-table">
        <thead>
          <tr>
            
            
            <th>Общая сумма</th>
            <th>Количество операций</th>
            <th>Риск</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={row.id}>
              <td>{row.amount}</td>
              <td>{row.notes}</td>
              <td>
                <span className={`risk-badge ${riskClassMap[row.risk]}`}>
                  {row.risk}
                </span>
              </td>
              <td>
                <span style={{padding: '7px 10px', background:'rgb(70, 151, 142)', borderRadius:'7px', color: '#fff', fontWeight: '700' }}>
                  {row.more}
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
