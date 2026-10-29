// src/pages/Stocks.js

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LineChart from '../components/Chart';
import '../App.css';

const Stocks = () => {
  const location = useLocation();
  const symbol = location.state;
  const [chartData, setChartData] = useState(null);
  const [stockInfo, setStockInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiKey = process.env.REACT_APP_API_KEY;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stock chart data
        const chartRes = await fetch(`https://yfapi.net/v8/finance/chart/${symbol}?range=1mo&interval=1d`, {
          headers: { 'x-api-key': apiKey }
        });
        const chartResult = await chartRes.json();
        const timestamps = chartResult.chart.result[0].timestamp;
        const prices = chartResult.chart.result[0].indicators.quote[0].close;
        const formattedDates = timestamps.map(t => {
          const date = new Date(t * 1000);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        });
        setChartData({
          labels: formattedDates,
          datasets: [
            {
              label: `${symbol} Closing Price`,
              data: prices,
              borderColor: '#191970',
              backgroundColor: '#cbd5e0',
            }
          ]
        });

        // Fetch quote info
        const infoRes = await fetch(`https://yfapi.net/v6/finance/quote?symbols=${symbol}`, {
          headers: { 'x-api-key': apiKey }
        });
        const infoResult = await infoRes.json();
        const data = infoResult.quoteResponse.result[0];
        setStockInfo({
          exchange: data.fullExchangeName || data.exchange,
          instrumentType: data.quoteType || 'N/A',
          previousClose: data.regularMarketPreviousClose,
          currentPrice: data.regularMarketPrice,
          symbol: data.symbol
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };

    fetchData();
  }, [symbol, apiKey]);

  return (
    <div className="stocks-page">
      {loading ? (
        <p>Loading Data...</p>
      ) : (
        <>
          <h2 className="stock-title">
            {stockInfo.exchange} ({stockInfo.symbol}) ${stockInfo.currentPrice}
          </h2>
          <div className="stock-details">
            <p><strong>Exchange Name:</strong> {stockInfo.exchange}</p>
            <p><strong>Instrument Type:</strong> {stockInfo.instrumentType}</p>
            <p><strong>Previous Close Price:</strong> ${stockInfo.previousClose}</p>
            <p><strong>Current Price:</strong> ${stockInfo.currentPrice}</p>
          </div>
          <div className="chart-container">
            <LineChart chartData={chartData} />
          </div>
        </>
      )}
    </div>
  );
};

export default Stocks;
