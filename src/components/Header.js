// src/components/Header.js

import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Header = () => {
  return (
    <div className="header">
      <div className="header-center">
        <Link to="/" className="header-title">
          Stock Market App
        </Link>
      </div>
    </div>
  );
};

export default Header;
