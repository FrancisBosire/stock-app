import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const SingleCard = ({ symbol, name, exchange }) => <article className="card">
  <h3 className="card-title">{symbol}</h3>
  {name && <p className="stock-card-name">{name}</p>}
  {exchange && <p className="stock-card-exchange">{exchange}</p>}
  <Link className="card-button" to={'/stocks/' + encodeURIComponent(symbol)}>View Details</Link>
</article>;
export default SingleCard;
