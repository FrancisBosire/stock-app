import { requestJson } from './requestJson';
export async function fetchYahoo(path, signal) {
  return requestJson('/api/yahoo' + path, { signal, provider: 'Yahoo Finance' });
}
