import React from 'react';
import PropTypes from 'prop-types';

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
