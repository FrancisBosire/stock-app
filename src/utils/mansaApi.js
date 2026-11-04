import { requestJson } from './requestJson';
export async function fetchMansa(path, signal) {
  return requestJson('/api/mansa' + path, { signal, provider: 'Mansa' });
}
export function getStockRows(body) {
  if (Array.isArray(body && body.stocks)) return body.stocks;
  if (Array.isArray(body && body.data)) return body.data;
  if (body && body.data && Array.isArray(body.data.stocks)) return body.data.stocks;
  return [];
}
export function getStock(body) {
  return (body && body.stock) || (body && body.data && body.data.stock) || (body && body.data) || body;
}
export function getStockSymbol(stock) { return (stock && (stock.ticker || stock.symbol || stock.stock_code)) || ''; }
export function getStockName(stock) { return (stock && (stock.name || stock.company_name || stock.company)) || getStockSymbol(stock); }
export function getStockPrice(stock) { return stock ? stock.price ?? stock.current_price ?? stock.last_price ?? stock.close ?? null : null; }
export function getStockChange(stock) { return stock ? stock.change ?? stock.change_amount ?? stock.price_change ?? null : null; }
export function getStockChangePct(stock) { return stock ? stock.change_pct ?? stock.change_percentage ?? stock.changePercent ?? stock.percent_change ?? null : null; }
export function getUpdatedAt(body, rows = []) {
  const data = body && body.data;
  const meta = (body && body.meta) || (data && data.meta);
  const row = rows.find(item => item.updated_at || item.updatedAt || item.timestamp);
  return (body && (body.updated_at || body.updatedAt)) ||
    (data && (data.updated_at || data.updatedAt || data.currentDateTime)) ||
    (meta && (meta.updated_at || meta.timestamp || meta.checked_at)) ||
    (row && (row.updated_at || row.updatedAt || row.timestamp)) || null;
}
