import React, { useState } from 'react';
import Cards from '../components/Cards';
import Search from '../components/Search';
import NseMarket from '../components/NseMarket';

const Home = () => {
  const [searchString, setSearchString] = useState('');

  return (
    <div>
      <Search searchStringUpdated={setSearchString} />
      <h3 className="section-title">Trending US Stocks</h3>
      <Cards searchString={searchString} />
      <NseMarket />
    </div>
  );
};

export default Home;
