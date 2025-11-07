import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import StepCounterparties from '../steps/StepCounterparties.jsx';

const cashflowData = [
  { month: 'Июль', inFlow: 12.4, outFlow: 9.1 },
  { month: 'Август', inFlow: 13.8, outFlow: 11.2 },
  { month: 'Сентябрь', inFlow: 15.6, outFlow: 12.5 },
  { month: 'Октябрь', inFlow: 18.9, outFlow: 14.7 },
  { month: 'Ноябрь', inFlow: 21.4, outFlow: 16.2 },
];

export default function StatisticsPage() {
  return (
    <div className="content-wrapper">
      <div className="page-card">
        <h3 className="section-title">Динамика движения средств</h3>
        <p className="helper-text">Следим за балансом поступлений и списаний по месяцам.</p>
        <ResponsiveContainer width="100%" height={260}>
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
            <Area type="monotone" dataKey="inFlow" name="Поступления" stroke="#55bb9b" fill="url(#flowIn)" strokeWidth={3} />
            <Area type="monotone" dataKey="outFlow" name="Списания" stroke="#2f3a45" fill="url(#flowOut)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <StepCounterparties />
    </div>
  );
}
