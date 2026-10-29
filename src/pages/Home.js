import React, { useState } from 'react';
import Cards from '../components/Cards';
import Search from '../components/Search';

const Home = () => {
  const [searchString, setSearchString] = useState('');

  return (
    <div>
      <Search searchStringUpdated={setSearchString} />
      
      {/* Title under the search box */}
      <h3 className="section-title">Trending Indexes</h3>

      <Cards searchString={searchString} />
    </div>
  );
};

export default Home;
