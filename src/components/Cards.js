import React, { useEffect, useState } from 'react';
import SingleCard from './SingleCard';
import { fetchYahoo } from '../utils/yahooApi';

const Cards = ({ searchString }) => {
  const [symbols, setSymbols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const fetchTrendingSymbols = async () => {
      try {
        const result = await fetchYahoo('/v1/finance/trending/US', controller.signal);
        const trendingSymbols = result?.finance?.result?.[0]?.quotes
          ?.map(quote => quote.symbol)
          .filter(Boolean) || [];
        setSymbols(trendingSymbols.slice(0, 10));
        if (trendingSymbols.length === 0) setError('No trending stocks were returned.');
      } catch (error) {
        if (error.name !== 'AbortError') setError(error.message || 'Unable to load trending stocks.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchTrendingSymbols();
    return () => controller.abort();
  }, []);

  const filteredSymbols = symbols.filter(symbol =>
    symbol.toLowerCase().includes(searchString.toLowerCase())
  );

  return (
    <div className="cards-list">
      {loading && <p role="status">Loading trending stocks…</p>}
      {!loading && error && <p role="alert">{error}</p>}
      {!loading && !error && filteredSymbols.length === 0 && <p>No stocks match your search.</p>}
      {!loading && !error && filteredSymbols.map(symbol => (
        <SingleCard key={symbol} symbol={symbol} />
      ))}
    </div>
  );
};

export default Cards;
