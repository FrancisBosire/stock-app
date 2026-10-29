import React, { useEffect, useState } from 'react';
import '../App.css';

const Slider = () => {
  const [marketData, setMarketData] = useState([]);
  const apiKey = process.env.REACT_APP_API_KEY;

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('https://yfapi.net/v6/finance/quote/marketSummary', {
          method: 'GET',
          headers: {
            'x-api-key': apiKey
          }
        });
        const result = await response.json();
        setMarketData(result.marketSummaryResponse.result);
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    };

    fetchMarketData();
  }, [apiKey]);

  return (
    <div className="slider">
      <div>
        {marketData.map((market, index) => {
          const change = market.regularMarketChangePercent?.fmt || '0.00%';
          const isNegative = change.startsWith('-');
          return (
            <span key={index} className="slider-market-raw">
              <span className="slider-name">{market.shortName}</span>:
              <span style={{ color: isNegative ? 'red' : 'green' }}>
                {isNegative ? '▼' : '▲'}
                {change}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default Slider;
