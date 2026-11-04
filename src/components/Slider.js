import React, { useEffect, useState } from 'react';
import '../App.css';
import { fetchYahoo } from '../utils/yahooApi';

const Slider = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetchYahoo('/v6/finance/quote/marketSummary', controller.signal)
      .then(result => setMarketData(result?.marketSummaryResponse?.result || []))
      .catch(requestError => { if (requestError.name !== 'AbortError') setError('Market summary is temporarily unavailable.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  return <div className="slider" aria-label="Market summary">
    {loading ? <p className="slider-message" role="status">Loading market summary…</p> : error ? <p className="slider-message" role="status">{error}</p> : !marketData.length ? <p className="slider-message">No market summary data available.</p> : <div>{marketData.map(market => {
      const change = market.regularMarketChangePercent?.fmt || '0.00%';
      const negative = change.startsWith('-');
      return <span key={market.symbol || market.shortName} className="slider-market-raw"><span className="slider-name">{market.shortName}</span>: <span className={negative ? 'market-negative' : 'market-positive'}>{negative ? '▼' : '▲'} {change}</span></span>;
    })}</div>}
  </div>;
};
export default Slider;
