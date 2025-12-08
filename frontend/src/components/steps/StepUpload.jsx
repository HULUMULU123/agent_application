import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useGlobalState } from '../../store/GlobalState.jsx';

export default function StepUpload({ onStartAnalysis, onUploadComplete, disabled }) {
  const fileInputRef = useRef(null);
  const [localStatus, setLocalStatus] = useState(null);
  const { uploadDocument, loading, error, lastUploadName } = useGlobalState();

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLocalStatus(`Отправляем ${file.name} ...`);
    onStartAnalysis();
    uploadDocument(file)
      .then(() => {
        setLocalStatus('Файл отправлен, запускаем анализ');
        onUploadComplete();
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
          <button className="primary-button" type="button" onClick={handleFilePicker} disabled={disabled || loading}>
            Загрузить и отправить
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
    </div>
  );
}

StepUpload.propTypes = {
  onStartAnalysis: PropTypes.func.isRequired,
  onUploadComplete: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

StepUpload.defaultProps = {
  disabled: false,
};
