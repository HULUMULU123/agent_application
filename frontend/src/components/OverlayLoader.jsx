import React from 'react';
import PropTypes from 'prop-types';

export default function OverlayLoader({ visible, label }) {
  if (!visible) return null;

  return (
    <div className="overlay">
      <div className="loader-card">
        <div className="spinner" aria-hidden />
        {label && <p className="loader-label">{label}</p>}
      </div>
    </div>
  );
}

OverlayLoader.propTypes = {
  visible: PropTypes.bool,
  label: PropTypes.string,
};

OverlayLoader.defaultProps = {
  visible: false,
  label: 'Агент готовит аналитику…',
};
