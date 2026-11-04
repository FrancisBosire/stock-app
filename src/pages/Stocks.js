import React, { useEffect, useState } from 'react';
import { Link, useParams, useOutletContext } from 'react-router-dom';
import LineChart from '../components/Chart';
import { fetchYahoo } from '../utils/yahooApi';
import '../App.css';

const Stocks = () => {
  const { symbol: routeSymbol } = useParams();
  const theme = useOutletContext();
  const symbol = routeSymbol ? routeSymbol.toUpperCase() : '';
  const [chartData, setChartData] = useState(null);
  const [stockInfo, setStockInfo] = useState(null);
  const [chartError, setChartError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true); setError(''); setChartError(''); setChartData(null); setStockInfo(null);
      try {
        const encoded = encodeURIComponent(symbol);
        const [quoteResult, chartResult] = await Promise.allSettled([
          fetchYahoo(`/v6/finance/quote?symbols=${encoded}`, controller.signal),
          fetchYahoo(`/v8/finance/chart/${encoded}?range=1mo&interval=1d`, controller.signal),
        ]);
        if (quoteResult.status === 'rejected') throw quoteResult.reason;
        const quote = quoteResult.value?.quoteResponse?.result?.[0];
        if (!quote) throw new Error(`No quote data was found for ${symbol}.`);
        setStockInfo({
          exchange: quote.fullExchangeName || quote.exchange || 'Unknown exchange',
          instrumentType: quote.quoteType || '',
          previousClose: quote.regularMarketPreviousClose,
          currentPrice: quote.regularMarketPrice,
          currency: quote.currency || 'USD',
          symbol: quote.symbol || symbol,
        });
        if (chartResult.status === 'rejected') setChartError('Price history is temporarily unavailable. The quote is still shown.');
        else {
          const chart = chartResult.value?.chart?.result?.[0];
          const timestamps = chart?.timestamp || [];
          const prices = chart?.indicators?.quote?.[0]?.close || [];
          const points = timestamps.map((timestamp, index) => ({ timestamp, price: prices[index] }))
            .filter(point => point.price !== null && point.price !== undefined && Number.isFinite(Number(point.price)));
          if (!points.length) setChartError('No recent price history was found for this stock.');
          else setChartData({
            labels: points.map(point => { const date = new Date(point.timestamp * 1000); return `${date.getMonth() + 1}/${date.getDate()}`; }),
            datasets: [{ label: `${symbol} Closing Price`, data: points.map(point => Number(point.price)), borderColor: '#191970', backgroundColor: '#cbd5e0', spanGaps: true }],
          });
        }
      } catch (requestError) {
        if (requestError.name !== 'AbortError') setError(requestError.message || 'Unable to load stock details.');
      } finally { if (!controller.signal.aborted) setLoading(false); }
    };
    fetchData();
    return () => controller.abort();
  }, [symbol]);

  const currency = stockInfo ? stockInfo.currency : 'USD';
  const formatCurrency = value => value === null || value === undefined ? 'Unavailable' : new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  return <div className="stocks-page">
    <div className="detail-back-links"><Link to="/us">← US Stocks</Link><Link to="/">All Markets</Link></div>
    {loading && <p role="status">Loading stock data…</p>}
    {!loading && error && <div role="alert"><p>{error}</p></div>}
    {!loading && stockInfo && <>
      <h2 className="stock-title">{stockInfo.exchange} ({stockInfo.symbol}) {formatCurrency(stockInfo.currentPrice)}</h2>
      <div className="stock-details">
        <p><strong>Exchange:</strong> {stockInfo.exchange}</p>
        {stockInfo.instrumentType && <p><strong>Instrument type:</strong> {stockInfo.instrumentType}</p>}
        {stockInfo.previousClose !== null && stockInfo.previousClose !== undefined && <p><strong>Previous close:</strong> {formatCurrency(stockInfo.previousClose)}</p>}
        <p><strong>Current price:</strong> {formatCurrency(stockInfo.currentPrice)}</p>
      </div>
      {chartError && <p role="status">{chartError}</p>}
      {chartData && <div className="chart-container"><LineChart chartData={chartData} currency={currency} theme={theme} /></div>}
    </>}
  </div>;
};
export default Stocks;

