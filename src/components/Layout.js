import React, { useEffect, useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Header from './Header';
import Slider from './Slider';
import '../App.css';

const getInitialTheme = () => {
  try {
    const saved = window.localStorage.getItem('stock-app-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Continue with the system preference when browser storage is unavailable.
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const Layout = () => {
  const { pathname } = useLocation();
  const [theme, setTheme] = useState(getInitialTheme);
  const showUsTicker = !pathname.startsWith('/nse');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { window.localStorage.setItem('stock-app-theme', theme); } catch { /* Theme still applies for this visit. */ }
  }, [theme]);

  return (
    <div className="app-shell" data-theme={theme}>
      <Header theme={theme} onToggleTheme={() => setTheme(current => current === 'dark' ? 'light' : 'dark')} />
      {showUsTicker && <Slider />}
      <Outlet context={theme} />
    </div>
  );
};

export default Layout;

