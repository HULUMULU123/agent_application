import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function Roadmap({ steps, activeStep, onStepClick, isAnalyzing }) {
  return (
    <section className="roadmap-wrapper">
      <div className="roadmap-header">
        <h2>Роадмап мультиагента</h2>
        <span>{isAnalyzing ? 'Аналитика в процессе…' : 'Нажмите на этап, чтобы вернуться'}</span>
      </div>
      <div className="timeline-flow" aria-hidden>
        {steps.map((step, index) => {
          const isCompleted = step.id < activeStep;
          const isCurrent = step.id === activeStep;
          const connectorSymbol = isCompleted || isCurrent ? '→' : '…';

          return (
            <React.Fragment key={`flow-${step.id}`}>
              <span
                className={classNames('timeline-flow__node', {
                  completed: isCompleted,
                  active: isCurrent,
                })}
              >
                {step.id}
              </span>
              {index !== steps.length - 1 && (
                <span
                  className={classNames('timeline-flow__connector', {
                    completed: isCompleted,
                    active: isCurrent,
                  })}
                >
                  {connectorSymbol}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="timeline" role="list">
        {steps.map((step, index) => {
          const isCompleted = step.id < activeStep;
          const isActive = step.id === activeStep;
          const connectorState = isCompleted ? 'completed' : isActive ? 'active' : 'upcoming';

          return (
            <div key={step.id} className="timeline-segment" role="listitem">
              <button
                type="button"
                className={classNames('timeline-node', {
                  completed: isCompleted,
                  active: isActive,
                })}
                onClick={() => onStepClick(step.id)}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="timeline-node__circle">
                  <span className="timeline-node__number">{step.id}</span>
                </span>
                <span className="timeline-node__meta">
                  <span className="timeline-node__title">{step.title}</span>
                  <span className="timeline-node__description">{step.description}</span>
                </span>
              </button>
              {index !== steps.length - 1 && (
                <div className={classNames('timeline-connector', connectorState)} aria-hidden>
                  <span className="timeline-connector__track" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
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
