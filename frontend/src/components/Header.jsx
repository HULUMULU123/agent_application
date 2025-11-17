import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import '../styles/Header.css';

const NAV_ITEMS = [
  {
    key: 'Главная',
    label: 'Главная',
    icon: (
      <path d="M12 4.2 5 9.5V20a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1V9.5l-7-5.3z" />
    ),
  },
  {
    key: 'Статистика',
    label: 'Статистика',
    icon: (
      <path d="M6 19h2.5V9H6v10zm4.75 0h2.5V5h-2.5v14zM15.5 19H18v-7h-2.5v7z" />
    ),
  },
  {
    key: 'История',
    label: 'История',
    icon: (
      <path d="M12 5a7 7 0 1 0 7 7h-2a5 5 0 1 1-5-5v3.2l2.6 2.6 1.4-1.4-2-2V5z" />
    ),
  },
];

export default function Header({ activePage, onNavigate }) {
  return (
    <header className="top-bar">
      <div className="brand">
        <span className="brand-mark" aria-hidden />
        <div className="brand-copy">
          <strong>Финансовый анализ</strong>
          <span>банковских выписок</span>
        </div>
      </div>
      <nav className="nav-menu" role="tablist" aria-label="Основная навигация">
        <div className="nav-rail">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={classNames('nav-item', { active: activePage === item.key })}
              onClick={() => onNavigate(item.key)}
              role="tab"
              aria-selected={activePage === item.key}
            >
              <span className="nav-item__icon" aria-hidden>
                <svg viewBox="0 0 24 24" focusable="false">
                  {item.icon}
                </svg>
              </span>
              <span className="nav-item__label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
      <div className="user-stack">
        <div className="user-avatar" aria-label="Изображение пользователя" >
          
          </div>
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
