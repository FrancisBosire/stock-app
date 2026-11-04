import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import UsStocks from './pages/UsStocks';
import Stocks from './pages/Stocks';
import NseStock from './pages/NseStock';
import NseMarket from './components/NseMarket';
import NotFound from './pages/NotFound';
function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} /><Route path="us" element={<UsStocks />} /><Route path="stocks/:symbol" element={<Stocks />} /><Route path="*" element={<NotFound />} />
    </Route>
    <Route path="/nse" element={<Layout />}><Route index element={<NseMarket />} /><Route path=":symbol" element={<NseStock />} /></Route>
  </Routes></BrowserRouter>;
}
export default App;
