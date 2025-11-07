import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import '../styles/Header.css';

const NAV_ITEMS = [
  { key: 'Главная', label: 'Главная' },
  { key: 'Статистика', label: 'Статистика' },
  { key: 'История', label: 'История' },
];

export default function Header({ activePage, onNavigate }) {
  return (
    <header className="top-bar">
      <div className="brand">Preza Finance AI</div>
      <nav className="nav-menu">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={classNames('nav-item', { active: activePage === item.key })}
            onClick={() => onNavigate(item.key)}
          >
            <span>{item.label}</span>
            <span className="indicator" />
          </button>
        ))}
      </nav>
      <div className="user-stack">
        <div className="user-avatar" aria-label="Изображение пользователя" />
        <button className="logout-button" type="button">
          Выйти
        </button>
      </div>
    </header>
  );
}

Header.propTypes = {
  activePage: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
};
