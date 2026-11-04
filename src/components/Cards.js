import React, { useEffect, useState } from 'react';
import SingleCard from './SingleCard';
import { fetchYahoo } from '../utils/yahooApi';

const Cards = ({ searchString = '' }) => {
  const [symbols, setSymbols] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchError, setSearchError] = useState('');
  const query = searchString.trim();

  useEffect(() => {
    const controller = new AbortController();
    fetchYahoo('/v1/finance/trending/US', controller.signal)
      .then(result => {
        const list = result?.finance?.result?.[0]?.quotes?.map(item => item.symbol).filter(Boolean) || [];
        setSymbols(list.slice(0, 10));
        if (!list.length) setError('No trending stocks were returned.');
      })
      .catch(requestError => { if (requestError.name !== 'AbortError') setError(requestError.message || 'Unable to load trending stocks.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]); setSearchError(''); setSearchLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    setSearchLoading(true); setSearchError('');
    const timer = setTimeout(() => {
      fetchYahoo('/v6/finance/autocomplete?region=US&lang=en&query=' + encodeURIComponent(query), controller.signal)
        .then(result => {
          const matches = result?.ResultSet?.Result || result?.resultSet?.result || [];
          setSuggestions(matches.filter(item => item.symbol && (item.type === 'S' || item.typeDisp === 'Equity')).slice(0, 12));
        })
        .catch(requestError => { if (requestError.name !== 'AbortError') setSearchError(requestError.message || 'Unable to search US stocks.'); })
        .finally(() => { if (!controller.signal.aborted) setSearchLoading(false); });
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);

  if (query.length === 1) return <p className="us-search-hint">Type at least 2 characters to search by company or ticker.</p>;
  if (query.length >= 2) return <div className="cards-list">
    {searchLoading && <p role="status">Searching US stocks…</p>}
    {!searchLoading && searchError && <p role="alert">{searchError}</p>}
    {!searchLoading && !searchError && !suggestions.length && <p>No US stocks found for “{query}”.</p>}
    {!searchLoading && !searchError && suggestions.map(item => <SingleCard key={item.symbol} symbol={item.symbol} name={item.name} exchange={item.exchDisp} />)}
  </div>;
  return <div className="cards-list">
    {loading && <p role="status">Loading trending stocks…</p>}
    {!loading && error && <p role="alert">{error}</p>}
    {!loading && !error && !symbols.length && <p>No trending stocks were returned.</p>}
    {!loading && !error && symbols.map(symbol => <SingleCard key={symbol} symbol={symbol} />)}
  </div>;
};
export default Cards;
