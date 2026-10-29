import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LineChart from '../components/Chart';
import { fetchYahoo } from '../utils/yahooApi';
import '../App.css';

const Stocks = () => {
  const { symbol: routeSymbol } = useParams();
  const symbol = routeSymbol ? decodeURIComponent(routeSymbol).toUpperCase() : '';
  const [chartData, setChartData] = useState(null);
  const [stockInfo, setStockInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError('');
      setChartData(null);
      setStockInfo(null);

      if (!symbol) {
        setError('Choose a stock from the home page to view its details.');
        setLoading(false);
        return;
      }

      try {
        const encodedSymbol = encodeURIComponent(symbol);
        const [chartResult, infoResult] = await Promise.all([
          fetchYahoo(`/v8/finance/chart/${encodedSymbol}?range=1mo&interval=1d`, controller.signal),
          fetchYahoo(`/v6/finance/quote?symbols=${encodedSymbol}`, controller.signal),
        ]);

        const chart = chartResult?.chart?.result?.[0];
        const timestamps = chart?.timestamp || [];
        const prices = chart?.indicators?.quote?.[0]?.close || [];
        const quote = infoResult?.quoteResponse?.result?.[0];

        if (!quote) throw new Error(`No quote data was found for ${symbol}.`);
        if (timestamps.length === 0 || prices.length === 0) {
          throw new Error(`No recent price history was found for ${symbol}.`);
        }

        setChartData({
          labels: timestamps.map(timestamp => {
            const date = new Date(timestamp * 1000);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }),
          datasets: [{
            label: `${symbol} Closing Price`,
            data: prices,
            borderColor: '#191970',
            backgroundColor: '#cbd5e0',
            spanGaps: true,
          }],
        });
        setStockInfo({
          exchange: quote.fullExchangeName || quote.exchange || 'Unknown exchange',
          instrumentType: quote.quoteType || 'N/A',
          previousClose: quote.regularMarketPreviousClose,
          currentPrice: quote.regularMarketPrice,
          symbol: quote.symbol || symbol,
        });
      } catch (error) {
        if (error.name !== 'AbortError') setError(error.message || 'Unable to load stock details.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [symbol]);

  return (
    <div className="stocks-page">
      {loading && <p role="status">Loading stock data…</p>}
      {!loading && error && (
        <div role="alert">
          <p>{error}</p>
          <Link to="/">Back to trending stocks</Link>
        </div>
      )}
      {!loading && stockInfo && chartData && (
        <>
          <h2 className="stock-title">
            {stockInfo.exchange} ({stockInfo.symbol}) ${stockInfo.currentPrice ?? 'N/A'}
          </h2>
          <div className="stock-details">
            <p><strong>Exchange Name:</strong> {stockInfo.exchange}</p>
            <p><strong>Instrument Type:</strong> {stockInfo.instrumentType}</p>
            <p><strong>Previous Close Price:</strong> ${stockInfo.previousClose ?? 'N/A'}</p>
            <p><strong>Current Price:</strong> ${stockInfo.currentPrice ?? 'N/A'}</p>
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
