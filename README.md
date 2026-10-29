# Stock Market App

A small React app for browsing trending US stocks. Search the current trending list, open a stock to see its exchange and quote details, and view its closing prices over the last month.

Market data comes from the Yahoo Finance API through [yfapi.net](https://yfapi.net/). An API key is required for the market summary, trending stocks, and stock details.

## Requirements

- Node.js and npm
- An API key for yfapi.net with access to the endpoints used by this app

## Run locally

1. Install the dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` and replace the example value with your API key:

   ```text
   REACT_APP_API_KEY=your_api_key
   ```

   Keep `.env` private. Restart the development server after changing it.

3. Start the app:

   ```sh
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser. The development server usually opens it automatically. Press `Ctrl+C` in the terminal to stop it.

Select **View Details** on a stock to open its detail page. The selected symbol is part of the URL, so refreshing that page keeps the selected stock.

## Production build

Run `npm run build` to create a production build in `build/`.

## API key note

This app calls yfapi.net directly from the browser. Create React App includes `REACT_APP_*` values in the client bundle, so the API key can be seen by visitors to a deployed site. Use a server-side API proxy and server-only environment variable before deploying with a private or quota-limited key. Do not commit `.env` or publish a real key.
