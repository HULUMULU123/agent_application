const mockAnalysis = {
  cashflow: [
    { month: 'Янв', inFlow: 18.4, outFlow: 12.1 },
    { month: 'Фев', inFlow: 19.2, outFlow: 11.8 },
    { month: 'Мар', inFlow: 20.1, outFlow: 13.4 },
    { month: 'Апр', inFlow: 21.7, outFlow: 14.1 },
    { month: 'Май', inFlow: 22.9, outFlow: 15.3 },
    { month: 'Июн', inFlow: 24.5, outFlow: 16.7 },
  ],
  category_split: [
    { category: 'Закупки', value: 12.7 },
    { category: 'Маркетинг', value: 9.4 },
    { category: 'Операционные расходы', value: 7.3 },
    { category: 'Налоги и сборы', value: 6.1 },
    { category: 'Логистика', value: 4.2 },
    { category: 'Технологии', value: 3.8 },
    { category: 'Прочее', value: 2.1 },
  ],
  balance_projection: [
    { quarter: 'Q1', base: 62, stress: 54 },
    { quarter: 'Q2', base: 74, stress: 61 },
    { quarter: 'Q3', base: 85, stress: 69 },
    { quarter: 'Q4', base: 97, stress: 77 },
  ],
  signals: [
    { title: 'Схема дробления платежей', count: 3, provider: 'ФНС' },
    { title: 'Нетипичные назначения платежей', count: 6, provider: 'Аналитика банка' },
    { title: 'Частые изменения реквизитов', count: 4, provider: 'Данные контрагентов' },
  ],
  registry: [
    { name: 'ООО «СеверМет»', inn: '7701234560', segment: 'Металлургия', operations: 128, risk: 'низкий' },
    { name: 'АО «Вектор»', inn: '7720456789', segment: 'IT-подряд', operations: 96, risk: 'средний' },
    { name: 'ООО «Логистик Про»', inn: '7812345678', segment: 'Логистика', operations: 74, risk: 'низкий' },
    { name: 'ООО «АгроИмпорт»', inn: '7709988776', segment: 'Поставки', operations: 58, risk: 'высокий' },
    { name: 'ООО «МедиаПоток»', inn: '7801122334', segment: 'Маркетинг', operations: 41, risk: 'средний' },
  ],
  counterparty_volume: [
    { name: 'ООО «СеверМет»', value: 12500000 },
    { name: 'АО «Вектор»', value: 9900000 },
    { name: 'ООО «Логистик Про»', value: 7600000 },
    { name: 'ООО «АгроИмпорт»', value: 6300000 },
  ],
  risk_mix: [
    { name: 'Низкий риск', value: 55 },
    { name: 'Средний риск', value: 32 },
    { name: 'Высокий риск', value: 13 },
  ],
  counterparty_trend: [
    { month: 'Июль', operations: 48 },
    { month: 'Авг', operations: 54 },
    { month: 'Сен', operations: 61 },
    { month: 'Окт', operations: 64 },
    { month: 'Ноя', operations: 68 },
    { month: 'Дек', operations: 71 },
  ],
  counterparty_velocity: [
    { week: '42 неделя', newPartners: 8, alerts: 2 },
    { week: '43 неделя', newPartners: 11, alerts: 3 },
    { week: '44 неделя', newPartners: 9, alerts: 3 },
    { week: '45 неделя', newPartners: 13, alerts: 4 },
    { week: '46 неделя', newPartners: 15, alerts: 5 },
  ],
};

export default mockAnalysis;
