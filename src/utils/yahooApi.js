const API_BASE_URL = 'https://yfapi.net';

export async function fetchYahoo(path, signal) {
  const apiKey = process.env.REACT_APP_API_KEY;
  if (!apiKey) {
    throw new Error('Yahoo Finance API key is missing. Add REACT_APP_API_KEY to your local .env file and restart the app.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'x-api-key': apiKey },
    signal,
  });

  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message = body?.message || body?.error || `Yahoo Finance request failed (${response.status}).`;
    throw new Error(message);
  }

  return body;
}
