import React from 'react';
import PropTypes from 'prop-types';

const recentDocuments = [
  {
    id: 'statement_november.pdf',
    type: 'PDF',
    uploadedAt: '12.11.2024, 09:12',
    status: 'обработано',
  },
  {
    id: 'counterparty_registry.csv',
    type: 'CSV',
    uploadedAt: '11.11.2024, 18:40',
    status: 'в очереди',
  },
  {
    id: 'statement_october.xlsx',
    type: 'XLSX',
    uploadedAt: '05.11.2024, 10:28',
    status: 'архив',
  },
];

const statusTone = {
  обработано: 'status-positive',
  'в очереди': 'status-progress',
  архив: 'status-muted',
};

export default function StepUpload({ onStartAnalysis, disabled }) {
  return (
    <div className="page-card">
      <h3 className="section-title">Загрузка документа</h3>
      <p className="helper-text">
        Вставьте ваш файл, а остальное оставьте нам — мультиагент сам поймет структуру
        выписки и подготовит следующий шаг.
      </p>
      <div className="upload-zone">
        <strong>Перетащите выписку сюда</strong>
        <span>или выберите документ на устройстве</span>
        <div className="upload-actions">
          <button className="secondary-button" type="button">
            Выбрать файл
          </button>
          <button className="primary-button" type="button" onClick={onStartAnalysis} disabled={disabled}>
            Запустить анализ
          </button>
        </div>
      </div>
      <div className="table-stack">
        <div className="table-header">
          <h4>Последние документы</h4>
          <span>Всё, что вы загружали за последние дни</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Документ</th>
              <th>Тип</th>
              <th>Загружено</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {recentDocuments.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.id}</td>
                <td>{doc.type}</td>
                <td>{doc.uploadedAt}</td>
                <td>
                  <span className={`status-chip ${statusTone[doc.status]}`}>{doc.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

StepUpload.propTypes = {
  onStartAnalysis: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

StepUpload.defaultProps = {
  disabled: false,
};
