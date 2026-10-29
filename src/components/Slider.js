import React, { useEffect, useState } from 'react';
import '../App.css';
import { fetchYahoo } from '../utils/yahooApi';

const Slider = () => {
  const [marketData, setMarketData] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchYahoo('/v6/finance/quote/marketSummary', controller.signal)
      .then(result => setMarketData(result?.marketSummaryResponse?.result || []))
      .catch(error => {
        if (error.name !== 'AbortError') console.error('Unable to load market summary:', error.message);
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="slider">
      <div>
        {marketData.map(market => {
          const change = market.regularMarketChangePercent?.fmt || '0.00%';
          const isNegative = change.startsWith('-');
          return (
            <span key={market.symbol || market.shortName} className="slider-market-raw">
              <span className="slider-name">{market.shortName}</span>:
              <span style={{ color: isNegative ? 'red' : 'green' }}>
                {isNegative ? '\u25BC' : '\u25B2'} {change}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default Slider;
