import React from 'react';

const historyEvents = [
  {
    time: '12:46',
    date: '12 ноября 2024',
    title: 'Готов отчет по контрагентам',
    description: 'Сформирована выгрузка для юридического отдела, добавлено 3 примечания.',
    status: 'готово',
  },
  {
    time: '11:20',
    date: '12 ноября 2024',
    title: 'Выявлены потенциальные риски',
    description: 'Три контрагента отмечены как требующие углубленной проверки.',
    status: 'предупреждение',
  },
  {
    time: '10:05',
    date: '12 ноября 2024',
    title: 'Анализ транзакций завершен',
    description: 'Проанализировано 1 274 транзакции, найдено 9 аномалий.',
    status: 'готово',
  },
  {
    time: '09:12',
    date: '12 ноября 2024',
    title: 'Загружена новая выписка',
    description: 'Файл «statement_november.pdf» успешно импортирован.',
    status: 'загрузка',
  },
];

const statusColor = {
  готово: 'linear-gradient(135deg, rgba(85, 187, 155, 0.25), rgba(85, 187, 155, 0.05))',
  предупреждение: 'linear-gradient(135deg, rgba(255, 200, 87, 0.32), rgba(255, 200, 87, 0.08))',
  загрузка: 'linear-gradient(135deg, rgba(47, 58, 69, 0.28), rgba(47, 58, 69, 0.08))',
};

export default function HistoryPage() {
  return (
    <div className="content-wrapper">
      <div className="page-card">
        <h3 className="section-title">Журнал действий мультиагента</h3>
        <p className="helper-text">Прозрачная история, чтобы быстро вернуться к важному шагу.</p>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {historyEvents.map((event) => (
            <div
              key={`${event.date}-${event.time}`}
              style={{
                borderRadius: 20,
                padding: '20px 24px',
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: 18px,
                background: statusColor[event.status],
                border: '1px solid rgba(85, 187, 155, 0.1)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 18 }}>{event.time}</span>
                <span style={{ color: '#536471', fontSize: 13 }}>{event.date}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <strong style={{ fontSize: 16 }}>{event.title}</strong>
                <span style={{ color: '#2f3a45', lineHeight: 1.5 }}>{event.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
