# Stock Market App

A React app for browsing trending US stocks and the Nairobi Securities Exchange (NSE). Search US companies or ticker symbols, view quote details and charts, and explore delayed NSE prices, market status, and company details.

## Requirements

- Node.js and npm
- A yfapi.net key for US market data
- A Mansa Markets key for NSE data

## Run locally

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` and add your keys:

   ```text
   YAHOO_API_KEY=your_yahoo_finance_api_key
   MANSA_API_KEY=your_mansa_api_key
   ```

   Do not use quotes. Keep `.env` private and restart the app after changing it. If your current file uses `REACT_APP_API_KEY`, rename that variable to `YAHOO_API_KEY`.

3. Start the development server:

   ```sh
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000).

When the US search is empty, the app shows trending stocks. Enter at least two characters to search by company or ticker. NSE stock history is loaded only when requested and may require a higher Mansa plan.

## API keys and deployment

The local Create React App proxy in `src/setupProxy.js` sends Yahoo and Mansa requests from the development server, keeping keys out of browser code. This proxy is for local development only. Before deploying, provide a server-side or serverless proxy for `/api/yahoo` and `/api/mansa`, and store keys as private server environment variables. Never put API keys in `REACT_APP_*` variables or commit `.env`.

## Production build

Run `npm run build` to create the production files in `build/`.
