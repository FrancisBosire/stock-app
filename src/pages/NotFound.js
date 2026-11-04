import React from 'react';
import { Link } from 'react-router-dom';
const NotFound = () => <main className="stocks-page"><h2 className="stock-title">Page not found</h2><p>The address may be incorrect or the page may have moved.</p><Link to="/">Return to all markets</Link></main>;
export default NotFound;
