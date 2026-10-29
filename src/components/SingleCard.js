// src/components/SingleCard.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const SingleCard = ({ symbol }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/stocks`, { state: symbol });
  };

  return (
    <div className="card">
      <h3 className="card-title">{symbol}</h3>
      <button className="card-button" onClick={handleClick}>
        View Details
      </button>
    </div>
  );
};

export default SingleCard;
