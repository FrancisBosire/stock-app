// src/components/Search.js

import React from 'react';
import Form from 'react-bootstrap/Form';
import '../App.css';

const Search = ({ searchStringUpdated }) => {
  const handleChange = (e) => {
    searchStringUpdated(e.target.value);
  };

  return (
    <div className="search-container">
      <Form.Control
        type="text"
        placeholder="Search for a stock..."
        onChange={handleChange}
      />
    </div>
  );
};

export default Search;
