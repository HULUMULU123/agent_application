import React from 'react';

const legalRows = [
  {
    id: 1,
    document: 'Договор поставки №182/24',
    counterparty: 'ООО «Астра»',
    date: '12.11.2024',
    obligation: 'Оплата поставки партия 4',
    amount: '1 200 000 ₽',
    notes: 'Оплатить до 20.11.2024',
    risk: 'низкий',
  },
  {
    id: 2,
    document: 'Соглашение о рассрочке',
    counterparty: 'ЗАО «Радар»',
    date: '06.11.2024',
    obligation: 'Погашение просроченной задолженности',
    amount: '980 000 ₽',
    notes: 'Контроль платежа в декабре',
    risk: 'средний',
  },
  {
    id: 3,
    document: 'Подряд №543/Б',
    counterparty: 'ООО «Мастер Групп»',
    date: '28.10.2024',
    obligation: 'Оплата этапа строительства',
    amount: '3 450 000 ₽',
    notes: 'Проверить закрывающие документы',
    risk: 'высокий',
  },
  {
    id: 4,
    document: 'Акт сверки',
    counterparty: 'ИП Ковалев',
    date: '02.11.2024',
    obligation: 'Подтвердить корректность данных',
    amount: '0 ₽',
    notes: 'Не выявлено расхождений',
    risk: 'низкий',
  },
];

const riskClassMap = {
  низкий: 'risk-low',
  средний: 'risk-medium',
  высокий: 'risk-high',
};

export default function StepLegal() {
  return (
    <div className="page-card">
      <h3 className="section-title">Юридический анализ &amp; отчет</h3>
      <p className="helper-text">
        Автоматический комплаенс анализ выделяет обязательства и риски, готовя базу для отчета
        службе безопасности и юридическому департаменту.
      </p>
      <table className="risk-table">
        <thead>
          <tr>
            <th>Документ</th>
            <th>Контрагент</th>
            <th>Дата</th>
            <th>Обязательство</th>
            <th>Сумма</th>
            <th>Комментарий</th>
            <th>Риск</th>
          </tr>
        </thead>
        <tbody>
          {legalRows.map((row) => (
            <tr key={row.id}>
              <td>{row.document}</td>
              <td>{row.counterparty}</td>
              <td>{row.date}</td>
              <td>{row.obligation}</td>
              <td>{row.amount}</td>
              <td>{row.notes}</td>
              <td>
                <span className={`risk-badge ${riskClassMap[row.risk]}`}>{row.risk}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
