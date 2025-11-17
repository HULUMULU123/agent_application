import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { useGlobalState } from '../../store/GlobalState.jsx';

const COLORS = ['#55bb9b', '#2f3a45', '#9ddbc7', '#ffc857'];

const counterpartiesByVolume = [
  { name: 'ООО «Астра»', value: 8600000 },
  { name: 'ИП Ковалев', value: 5400000 },
  { name: 'ЗАО «Радар»', value: 4200000 },
  { name: 'АО «Сфера»', value: 3600000 },
];

const riskMix = [
  { name: 'Низкий', value: 64 },
  { name: 'Средний', value: 28 },
  { name: 'Высокий', value: 8 },
];

const trendData = [
  { month: 'Июль', operations: 62 },
  { month: 'Авг', operations: 74 },
  { month: 'Сен', operations: 81 },
  { month: 'Окт', operations: 95 },
  { month: 'Ноя', operations: 108 },
];

const anomaliesDefault = [
  { label: 'Сомнительные связи', count: 4 },
  { label: 'Нетипичные суммы', count: 7 },
  { label: 'Неактивные контрагенты', count: 2 },
];

const velocityData = [
  { week: 'Нед 1', newPartners: 4, alerts: 1 },
  { week: 'Нед 2', newPartners: 7, alerts: 3 },
  { week: 'Нед 3', newPartners: 6, alerts: 2 },
  { week: 'Нед 4', newPartners: 9, alerts: 2 },
  { week: 'Нед 5', newPartners: 11, alerts: 4 },
];

const innRegistryDefault = [
  { name: 'ООО «Астра»', inn: '7712458790', segment: 'Поставщик', operations: 86, risk: 'низкий' },
  { name: 'ЗАО «Радар»', inn: '7723589411', segment: 'Оборудование', operations: 42, risk: 'средний' },
  { name: 'ООО «Мастер Групп»', inn: '7736984102', segment: 'Строительство', operations: 28, risk: 'высокий' },
  { name: 'ИП Ковалев', inn: '7705932147', segment: 'Услуги', operations: 35, risk: 'низкий' },
  { name: 'АО «Сфера»', inn: '7745896300', segment: 'IT', operations: 24, risk: 'средний' },
];

const riskBadgeMap = {
  низкий: 'risk-low',
  средний: 'risk-medium',
  высокий: 'risk-high',
};

export default function StepCounterparties() {
  const { analysis } = useGlobalState();

  const anomalies = (analysis.signals || []).length
    ? analysis.signals.map((signal, index) => ({
        label: signal.title,
        count: index + 1,
        provider: signal.provider,
      }))
    : anomaliesDefault;

  const innRegistry = (analysis.scores || []).length
    ? analysis.scores.map((score, index) => ({
        name: `Контрагент ${index + 1}`,
        inn: score.inn,
        segment: score.provider,
        operations: Math.round((score.score || 0.5) * 120),
        risk: score.score > 0.8 ? 'низкий' : score.score > 0.6 ? 'средний' : 'высокий',
      }))
    : innRegistryDefault;

  return (
    <div className="dashboard-grid">
      <div className="metric-card">
        <span className="metric-label">ТОП-4 транзакций по сумме</span>
        <span className="metric-value">18,2 млн ₽</span>
        <div className="mini-trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#55bb9b" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#55bb9b" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(85, 187, 155, 0.25)" />
              <XAxis dataKey="month" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Line type="monotone" dataKey="operations" stroke="url(#lineGradient)" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="helper-text">Увеличение транзакций за последние <b>5</b> месяцев на <b>+42%</b></p>
      </div>

      <div className="metric-card">
        <span className="metric-label">Топ контрагентов по объему</span>
        <div className="chart-shell chart-shell--compact">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={counterpartiesByVolume}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(47, 58, 69, 0.12)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#2f3a45' }}
                interval={0}
                height={60}
                angle={-12}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 12, fill: '#536471' }} tickFormatter={(value) => `${(value / 1000000).toFixed(1)}м`} />
              <Tooltip formatter={(value) => `${value.toLocaleString('ru-RU')} ₽`} />
              <Bar dataKey="value" radius={[16, 16, 8, 8]} fill="#55bb9b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="metric-card">
        <span className="metric-label">Распределение транзакций по уровню риска</span>
        <div className="chart-shell chart-shell--compact">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskMix}
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={38}
                paddingAngle={4}
                dataKey="value"
              >
                {riskMix.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="helper-text" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {riskMix.map((item) => (
            <li key={item.name} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span>{item.name}</span>
              <strong>{item.value}%</strong>
            </li>
          ))}
        </ul>
      </div>

      <div className="metric-card">
        <span className="metric-label">Аномалии и сигналы</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {anomalies.map((item, index) => (
            <div
              key={item.label}
              style={{
                background: index === 1 ? 'rgba(255, 200, 87, 0.18)' : 'rgba(85, 187, 155, 0.15)',
                borderRadius: 16,
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontWeight: 600, color: '#2f3a45' }}>{item.label}</span>
                {item.provider && (
                  <p className="helper-text" style={{ margin: 0 }}>
                    {item.provider}
                  </p>
                )}
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#2f3a45' }}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="metric-card metric-card--wide">
        <span className="metric-label">Динамика новых контрагентов</span>
        <div className="chart-shell">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={velocityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(47, 58, 69, 0.14)" />
              <XAxis dataKey="week" tick={{ fill: '#536471', fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#536471', fontSize: 12 }} />
              <Tooltip formatter={(value) => `${value} контрагентов`} />
              <Legend verticalAlign="top" iconType="circle" height={32} />
              <Line type="monotone" dataKey="newPartners" name="Новые партнеры" stroke="#55bb9b" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="alerts" name="Контрагенты для проверки" stroke="#2f3a45" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="metric-card metric-card--wide">
        <span className="metric-label">Регистры ИНН и оценка риска</span>
        <table className="data-table">
          <thead>
            <tr>
              <th>Контрагент</th>
              <th>ИНН</th>
              <th>Сегент</th>
              <th>Операций</th>
              <th>Риск</th>
            </tr>
          </thead>
          <tbody>
            {innRegistry.map((row) => (
              <tr key={row.inn}>
                <td>{row.name}</td>
                <td>{row.inn}</td>
                <td>{row.segment}</td>
                <td>{row.operations}</td>
                <td>
                  <span className={`status-chip ${riskBadgeMap[row.risk]}`}>{row.risk}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
