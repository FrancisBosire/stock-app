// src/components/Layout.js

import React from 'react';
import Header from './Header';
import Slider from './Slider';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div>
      <Header />
      <Slider />
      <Outlet />
    </div>
  );
};

export default Layout;
