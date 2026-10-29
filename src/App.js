// src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Stocks from './pages/Stocks';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="stocks" element={<Stocks />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
