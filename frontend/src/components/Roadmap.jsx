import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function Roadmap({ steps, activeStep, onStepClick, isAnalyzing }) {
  return (
    <div className="roadmap-wrapper">
      <div className="roadmap-header">
        <h2>Роадмап мультиагента</h2>
        <span>{isAnalyzing ? 'Аналитика в процессе…' : 'Нажмите на этап, чтобы вернуться'}</span>
      </div>
      <div className="steps-track">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={classNames('step-chip', {
              active: activeStep === step.id,
              completed: step.id < activeStep,
            })}
            onClick={() => onStepClick(step.id)}
          >
            <div className="step-index">{step.id}</div>
            <div className="step-label">{step.title}</div>
            <div className="step-description">{step.description}</div>
            {index !== steps.length - 1 && <span className="timeline-connector" />}
          </div>
        ))}
      </div>
    </div>
  );
}

Roadmap.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    })
  ).isRequired,
  activeStep: PropTypes.number.isRequired,
  onStepClick: PropTypes.func.isRequired,
  isAnalyzing: PropTypes.bool.isRequired,
};
