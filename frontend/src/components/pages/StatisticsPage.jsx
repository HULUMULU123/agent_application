import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import StepCounterparties from '../steps/StepCounterparties.jsx';

const cashflowData = [
  { month: 'Июль', inFlow: 12.4, outFlow: 9.1 },
  { month: 'Август', inFlow: 13.8, outFlow: 11.2 },
  { month: 'Сентябрь', inFlow: 15.6, outFlow: 12.5 },
  { month: 'Октябрь', inFlow: 18.9, outFlow: 22.7 },
  { month: 'Ноябрь', inFlow: 21.4, outFlow: 16.2 },
];

const categorySplit = [
  { category: 'Зарплатные проекты', value: 6.4 },
  { category: 'Подрядчики', value: 4.8 },
  { category: 'Налоги', value: 3.1 },
  { category: 'Операционные расходы', value: 2.6 },
  { category: 'Инвестиции', value: 1.9 },
];

const balanceProjection = [
  { quarter: 'Q1', base: 42, stress: 35 },
  { quarter: 'Q2', base: 48, stress: 38 },
  { quarter: 'Q3', base: 54, stress: 43 },
  { quarter: 'Q4', base: 61, stress: 46 },
];

export default function StatisticsPage() {
  return (
    <div className="content-wrapper">
      <div className="page-card">
        <h3 className="section-title">Динамика движения средств</h3>
        <p className="helper-text">Следим за балансом поступлений и списаний по месяцам.</p>
        <div className="chart-shell">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashflowData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="flowIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#55bb9b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#55bb9b" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="flowOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2f3a45" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#2f3a45" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(47, 58, 69, 0.18)" />
              <XAxis dataKey="month" tick={{ fill: '#2f3a45', fontSize: 13 }} />
              <YAxis tick={{ fill: '#536471', fontSize: 12 }} tickFormatter={(value) => `${value.toFixed(1)} млн`} />
              <Tooltip formatter={(value) => `${value.toFixed(2)} млн ₽`} />
              <Legend verticalAlign="top" iconType="circle" height={32} />
              <Area type="monotone" dataKey="inFlow" name="Поступления" stroke="#55bb9b" fill="url(#flowIn)" strokeWidth={3} />
              <Area type="monotone" dataKey="outFlow" name="Расходные операции" stroke="#2f3a45" fill="url(#flowOut)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Структура расходов по категориям</h3>
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySplit} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(47, 58, 69, 0.12)" />
                <XAxis dataKey="category" tick={{ fill: '#2f3a45', fontSize: 12 }} interval={0} angle={-12} textAnchor="end" height={70} />
                <YAxis tick={{ fill: '#536471', fontSize: 12 }} tickFormatter={(value) => `${value.toFixed(1)} млн`} />
                <Tooltip formatter={(value) => `${value.toFixed(2)} млн ₽`} />
                <Bar dataKey="value" fill="#55bb9b" radius={[14, 14, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* <div className="chart-card">
          <h3>Прогноз баланса</h3>
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={balanceProjection} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(47, 58, 69, 0.12)" />
                <XAxis dataKey="quarter" tick={{ fill: '#2f3a45', fontSize: 12 }} />
                <YAxis tick={{ fill: '#536471', fontSize: 12 }} tickFormatter={(value) => `${value} млн`} />
                <Tooltip formatter={(value) => `${value} млн ₽`} />
                <Legend verticalAlign="top" iconType="circle" height={32} />
                <Line type="monotone" dataKey="base" name="Базовый сценарий" stroke="#55bb9b" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="stress" name="Стресс сценарий" stroke="#2f3a45" strokeWidth={3} dot={{ r: 4 }} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div> */}
      </div>
      <StepCounterparties />
    </div>
  );
}
