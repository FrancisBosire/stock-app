// src/components/Cards.js

import React, { useEffect, useState } from 'react';
import SingleCard from './SingleCard';
import '../App.css';

const Cards = ({ searchString }) => {
  const [symbols, setSymbols] = useState([]);
  const apiKey = process.env.REACT_APP_API_KEY;

  useEffect(() => {
    const fetchTrendingSymbols = async () => {
      try {
        const response = await fetch('https://yfapi.net/v1/finance/trending/US', {
          method: 'GET',
          headers: {
            'x-api-key': apiKey
          }
        });
        const result = await response.json();
        const trendingSymbols = result.finance.result[0].quotes.map(q => q.symbol);
        setSymbols(trendingSymbols.slice(0, 10)); // limit to 10
      } catch (error) {
        console.error('Error fetching trending symbols:', error);
      }
    };

    fetchTrendingSymbols();
  }, [apiKey]);

  return (
    <div className="cards-list">
      {symbols
        .filter(symbol => symbol.toLowerCase().includes(searchString.toLowerCase()))
        .map((symbol, index) => (
          <SingleCard key={index} symbol={symbol} />
        ))}
    </div>
  );
};

export default Cards;
