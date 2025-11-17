import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useGlobalState } from '../../store/GlobalState.jsx';

const statusTone = {
  загружено: 'status-positive',
  готово: 'status-positive',
  'в очереди': 'status-progress',
  анализируется: 'status-progress',
  архив: 'status-muted',
  черновик: 'status-muted',
};

export default function StepUpload({ onStartAnalysis, disabled }) {
  const fileInputRef = useRef(null);
  const [localStatus, setLocalStatus] = useState(null);
  const { documents, uploadDocument, loading, error, lastUploadName } = useGlobalState();

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLocalStatus(`Отправляем ${file.name} ...`);
    uploadDocument(file)
      .then(() => {
        setLocalStatus('Файл отправлен, запускаем анализ');
        onStartAnalysis();
      })
      .catch(() => {
        setLocalStatus('Не удалось загрузить файл, попробуйте снова');
      })
      .finally(() => {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
  };

  const handleFilePicker = () => {
    fileInputRef.current?.click();
  };

  const formatType = (kind) => {
    if (!kind) return '—';
    if (['csv', 'pdf', 'excel'].includes(kind)) {
      return kind.toUpperCase();
    }
    return kind;
  };

  const formatDate = (value) => {
    if (!value) return '—';
    try {
      const parsed = new Date(value);
      return parsed.toLocaleString('ru-RU');
    } catch (err) {
      return value;
    }
  };

  return (
    <div className="page-card">
      <h3 className="section-title">Загрузка документа</h3>
      <p className="helper-text">
        Вставьте ваш файл, а остальное оставьте нам - Агент сам поймет структуру
        выписки и подготовит следующий шаг.
      </p>
      <div className="upload-zone">
        <strong>Перетащите выписку сюда</strong>
        <span>или выберите документ на устройстве</span>
        <div className="upload-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.pdf,.xls,.xlsx"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <button className="secondary-button" type="button" onClick={handleFilePicker} disabled={disabled || loading}>
            Выбрать файл
          </button>
          <button className="primary-button" type="button" onClick={onStartAnalysis} disabled={disabled || loading}>
            Запустить анализ
          </button>
        </div>
        {(localStatus || lastUploadName) && (
          <p className="helper-text" style={{ marginTop: 12 }}>
            {localStatus || `Последний документ: ${lastUploadName}`}
          </p>
        )}
        {error && (
          <p className="helper-text" style={{ marginTop: 12, color: '#d33' }}>
            {error}
          </p>
        )}
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
            {documents.map((doc) => (
              <tr key={doc.id || doc.display_name}>
                <td>{doc.display_name || doc.id}</td>
                <td>{formatType(doc.kind || doc.type)}</td>
                <td>{formatDate(doc.uploaded_at || doc.uploadedAt)}</td>
                <td>
                  <span className={`status-chip ${statusTone[doc.status] || 'status-progress'}`}>
                    {doc.status || 'анализируется'}
                  </span>
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
