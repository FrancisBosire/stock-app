import React, { useEffect, useState } from 'react';
import { Link, useParams, useOutletContext } from 'react-router-dom';
import LineChart from '../components/Chart';
import { fetchMansa, getStock, getStockChange, getStockChangePct, getStockName, getStockPrice, getUpdatedAt } from '../utils/mansaApi';
import '../App.css';

const hasValue = value => value !== null && value !== undefined && value !== '';
const formatCurrency = (value, currency = 'KES') => {
  if (!hasValue(value)) return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? new Intl.NumberFormat('en-KE', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount) : String(value);
};
const formatNumber = value => hasValue(value) && Number.isFinite(Number(value)) ? new Intl.NumberFormat('en-KE').format(Number(value)) : (hasValue(value) ? String(value) : null);
const formatUpdatedAt = value => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
};

const NseStock = () => {
  const { symbol: routeSymbol } = useParams();
  const theme = useOutletContext();
  const symbol = routeSymbol ? routeSymbol.toUpperCase() : '';
  const [stock, setStock] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [marketStatus, setMarketStatus] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartRequested, setChartRequested] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setStock(null); setUpdatedAt(null); setMarketStatus(null);
    setChartData(null); setChartRequested(false); setHistoryError(''); setHistoryLoading(false);
    fetchMansa('/markets/exchanges/NSE/stocks/' + encodeURIComponent(symbol), controller.signal)
      .then(body => {
        const result = getStock(body);
        if (!result || (getStockPrice(result) == null && !getStockName(result))) throw new Error('No quote data was returned for ' + symbol + '.');
        setStock(result); setUpdatedAt(getUpdatedAt(body, [result]));
      })
      .catch(requestError => { if (requestError.name !== 'AbortError') setError(requestError.message || 'Unable to load stock details.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    fetchMansa('/markets/calendar/NSE/is-open', controller.signal)
      .then(result => setMarketStatus(result && (result.data || result)))
      .catch(() => setMarketStatus({ unavailable: true }));
    return () => controller.abort();
  }, [symbol]);

  useEffect(() => {
    if (!chartRequested || !symbol) return undefined;
    const controller = new AbortController();
    setHistoryLoading(true); setHistoryError('');
    fetchMansa('/markets/exchanges/NSE/stocks/' + encodeURIComponent(symbol) + '/history?range=1Y', controller.signal)
      .then(body => {
        const points = body?.data?.points || body?.points || [];
        const valid = points.filter(point => point.date && hasValue(point.close) && Number.isFinite(Number(point.close)));
        if (!valid.length) throw new Error('No historical price points were returned.');
        setChartData({
          labels: valid.map(point => new Date(point.date + 'T12:00:00').toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: '2-digit' })),
          datasets: [{ label: symbol + ' closing price', data: valid.map(point => Number(point.close)), borderColor: '#191970', backgroundColor: 'rgba(25, 25, 112, 0.12)', fill: true, tension: 0.2 }],
        });
      })
      .catch(requestError => { if (requestError.name !== 'AbortError') setHistoryError('Price history is unavailable. Mansa may require a higher API plan for historical data.'); })
      .finally(() => { if (!controller.signal.aborted) setHistoryLoading(false); });
    return () => controller.abort();
  }, [chartRequested, symbol]);

  const currency = stock && stock.currency ? stock.currency : 'KES';
  const updatedDate = updatedAt ? new Date(updatedAt) : null;
  const marketIsOpen = marketStatus && (marketStatus.is_open === true || marketStatus.status === 'open');
  const quoteIsStale = marketIsOpen && updatedDate && !Number.isNaN(updatedDate.getTime()) && Date.now() - updatedDate.getTime() > 90 * 60 * 1000;
  const change = getStockChange(stock);
  const changePct = getStockChangePct(stock);
  const details = [
    ['Exchange', 'Nairobi Securities Exchange'], ['Sector', stock && stock.sector],
    ['Daily change', hasValue(change) ? formatCurrency(change, currency) : null],
    ['Daily change %', hasValue(changePct) ? (Number(changePct) > 0 ? '+' : '') + Number(changePct).toFixed(2) + '%' : null],
    ['Previous close', stock && formatCurrency(stock.previous_close ?? stock.previousClose, currency)],
    ['Open', stock && formatCurrency(stock.open, currency)], ['Day high', stock && formatCurrency(stock.high, currency)],
    ['Day low', stock && formatCurrency(stock.low, currency)], ['Volume', stock && formatNumber(stock.volume ?? stock.trading_volume)],
    ['Market capitalization', stock && formatCurrency(stock.market_cap ?? stock.marketCap, currency)],
  ].filter(([, value]) => hasValue(value));

  return <div className="stocks-page">
    <div className="detail-back-links"><Link to="/nse">← NSE Stocks</Link><Link to="/">All Markets</Link></div>
    {loading && <p role="status">Loading NSE quote…</p>}
    {!loading && error && <div role="alert"><p>{error}</p></div>}
    {!loading && stock && <>
      <h2 className="stock-title">{getStockName(stock)} ({stock.ticker || stock.symbol || symbol})</h2>
      <p className="nse-detail-price">{formatCurrency(getStockPrice(stock), currency) || 'Price unavailable'}</p>
      {hasValue(change) && <p className={'nse-change ' + (Number(change) < 0 ? 'negative' : 'positive')}>{formatCurrency(change, currency)} today</p>}
      {hasValue(changePct) && <p className={'nse-change ' + (Number(changePct) < 0 ? 'negative' : 'positive')}>{(Number(changePct) > 0 ? '+' : '') + Number(changePct).toFixed(2)}% today</p>}
      <p className={'nse-freshness' + (quoteIsStale ? ' is-stale' : '')}>Delayed market data{updatedAt ? ' · Updated ' + formatUpdatedAt(updatedAt) : ''}{quoteIsStale ? ' · May be stale while market is open' : ''}</p>
      {marketStatus && <p className="nse-market-status">{marketStatus.unavailable ? 'Market status unavailable' : (marketIsOpen ? 'Market open' : 'Market closed')}</p>}
      {details.length > 0 && <div className="stock-details">{details.map(([label, value]) => <p key={label}><strong>{label}:</strong> {value}</p>)}</div>}
      <section className="nse-chart-section" aria-labelledby="nse-chart-title">
        <h3 id="nse-chart-title">1-year closing price history</h3>
        {!chartRequested && <button className="card-button" type="button" onClick={() => setChartRequested(true)}>Load price chart</button>}
        {historyLoading && <p role="status">Loading price history…</p>}
        {!historyLoading && historyError && <p className="nse-history-note" role="status">{historyError}</p>}
        {!historyLoading && chartData && <div className="nse-chart-container"><LineChart chartData={chartData} currency={currency} theme={theme} /></div>}
      </section>
    </>}
  </div>;
};
export default NseStock;

