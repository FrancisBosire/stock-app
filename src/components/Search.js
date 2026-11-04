import React from 'react';
import Form from 'react-bootstrap/Form';
import '../App.css';

const Search = ({ searchStringUpdated }) => <div className="search-container">
  <Form.Control type="search" placeholder="Search company or ticker (e.g. MSFT)..." aria-label="Search US stocks by company or ticker" onChange={event => searchStringUpdated(event.target.value)} />
</div>;
export default Search;
