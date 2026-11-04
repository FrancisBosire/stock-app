import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import { fetchMansa, getStockChange, getStockChangePct, getStockName, getStockPrice, getStockRows, getStockSymbol, getUpdatedAt } from '../utils/mansaApi';

const formatPrice = (value, currency = 'KES', signed = false) => {
  if (value === null || value === undefined || value === '') return 'Price unavailable';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);
  const formatted = new Intl.NumberFormat('en-KE', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(amount));
  return (amount < 0 ? '−' : (signed && amount > 0 ? '+' : '')) + formatted;
};
const formatUpdatedAt = value => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
};

const NseMarket = () => {
  const [body, setBody] = useState(null);
  const [marketStatus, setMarketStatus] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('ticker');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setMarketStatus(null);
    fetchMansa('/markets/exchanges/NSE/stocks?limit=200&sort_by=ticker&order=asc', controller.signal)
      .then(result => setBody(result))
      .catch(requestError => { if (requestError.name !== 'AbortError') setError(requestError.message || 'Unable to load NSE stocks.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    fetchMansa('/markets/calendar/NSE/is-open', controller.signal)
      .then(result => setMarketStatus(result && (result.data || result)))
      .catch(() => setMarketStatus({ unavailable: true }));
    return () => controller.abort();
  }, [reload]);

  const rows = getStockRows(body);
  const updatedAt = getUpdatedAt(body, rows);
  const marketIsOpen = marketStatus && (marketStatus.is_open === true || marketStatus.status === 'open');
  const updatedDate = updatedAt ? new Date(updatedAt) : null;
  const stale = marketIsOpen && updatedDate && !Number.isNaN(updatedDate.getTime()) && Date.now() - updatedDate.getTime() > 90 * 60 * 1000;
  const displayRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = rows.filter(stock => !query || (getStockSymbol(stock) + ' ' + getStockName(stock)).toLowerCase().includes(query));
    const val = stock => sortBy === 'price' ? getStockPrice(stock) : sortBy === 'change' ? (getStockChangePct(stock) ?? getStockChange(stock)) : sortBy === 'volume' ? (stock.volume ?? stock.trading_volume ?? stock.trades) : getStockSymbol(stock);
    return filtered.slice().sort((a, b) => {
      const left = val(a); const right = val(b);
      const missingLeft = left === null || left === undefined || left === '' || (sortBy !== 'ticker' && !Number.isFinite(Number(left)));
      const missingRight = right === null || right === undefined || right === '' || (sortBy !== 'ticker' && !Number.isFinite(Number(right)));
      if (missingLeft || missingRight) return missingLeft === missingRight ? 0 : missingLeft ? 1 : -1;
      const cmp = sortBy === 'ticker' ? String(left).localeCompare(String(right)) : Number(left) - Number(right);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [rows, search, sortBy, sortOrder]);

  const statusText = !marketStatus ? 'Checking market status…' : marketStatus.unavailable ? 'Market status unavailable' : marketIsOpen ? 'Market open' : marketStatus.is_open === false || marketStatus.status === 'closed' ? 'Market closed' : 'Market status unavailable';
  return <section className="nse-market" aria-labelledby="nse-market-title">
    <div className="nse-market-heading">
      <div>
        <h2 id="nse-market-title" className="section-title">Nairobi Securities Exchange</h2>
        <div className="nse-market-meta">
          <span className={'nse-market-status' + (marketIsOpen ? ' is-open' : '')} role="status">{statusText}</span>
          <p className={'nse-freshness' + (stale ? ' is-stale' : '')}>Delayed market data{updatedAt ? ' · Updated ' + formatUpdatedAt(updatedAt) : ''}{stale ? ' · May be stale while market is open' : ''}</p>
        </div>
      </div>
      <div className="nse-market-controls">
        <Form.Control className="nse-search" type="search" placeholder="Search NSE stocks..." aria-label="Search NSE stocks" value={search} onChange={event => setSearch(event.target.value)} />
        <Form.Select aria-label="Sort NSE stocks by" value={sortBy} onChange={event => setSortBy(event.target.value)}><option value="ticker">Sort: Ticker</option><option value="price">Sort: Price</option><option value="change">Sort: Daily change</option><option value="volume">Sort: Volume</option></Form.Select>
        <Form.Select aria-label="Sort order" value={sortOrder} onChange={event => setSortOrder(event.target.value)}><option value="asc">Ascending</option><option value="desc">Descending</option></Form.Select>
      </div>
    </div>
    {loading && <p role="status">Loading NSE stocks…</p>}
    {!loading && error && <div role="alert"><p>{error}</p><button className="card-button" type="button" onClick={() => setReload(value => value + 1)}>Try again</button></div>}
    {!loading && !error && displayRows.length === 0 && <p>No NSE stocks match your search.</p>}
    {!loading && !error && <div className="cards-list">{displayRows.map(stock => {
      const symbol = getStockSymbol(stock);
      if (!symbol) return null;
      const pct = getStockChangePct(stock); const change = getStockChange(stock);
      const changeValue = Number(pct !== null ? pct : change);
      const currency = stock.currency || 'KES';
      return <article className="nse-stock-card" key={symbol}>
        <h3 className="card-title">{symbol}</h3><p className="nse-company-name">{getStockName(stock)}</p>
        <p className="nse-price">{formatPrice(getStockPrice(stock), currency)}</p>
        {(change !== null || pct !== null) && <p className={'nse-change ' + (changeValue < 0 ? 'negative' : 'positive')}>{change !== null ? formatPrice(change, currency, true) : ''}{change !== null && pct !== null ? ' · ' : ''}{pct !== null ? (Number(pct) > 0 ? '+' : '') + Number(pct).toFixed(2) + '%' : ''} today</p>}
        <Link className="card-button nse-details-button" to={'/nse/' + encodeURIComponent(symbol)}>View Details</Link>
      </article>;
    })}</div>}
  </section>;
};
export default NseMarket;
