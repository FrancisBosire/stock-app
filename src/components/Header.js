import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../App.css';

const Header = ({ theme, onToggleTheme }) => {
  const { pathname } = useLocation();
  const isNse = pathname.startsWith('/nse');
  const isUs = pathname.startsWith('/us') || pathname.startsWith('/stocks/');
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <header className="header">
      <Link to="/" className="header-title" aria-label="Stock Market App home — both markets">Stock Market App</Link>
      <div className="header-actions">
        <nav className="header-nav" aria-label="Main navigation">
          <Link to="/us" className={isUs ? 'active' : undefined} aria-current={isUs ? 'page' : undefined}>US Stocks</Link>
          <Link to="/nse" className={isNse ? 'active' : undefined} aria-current={isNse ? 'page' : undefined}>Nairobi NSE</Link>
        </nav>
        <button
          className="theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label={'Switch to ' + nextTheme + ' mode'}
          title={'Switch to ' + nextTheme + ' mode'}
        >
          <span className="theme-toggle-icon" aria-hidden="true">{theme === 'dark' ? '☼' : '☾'}</span>
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
