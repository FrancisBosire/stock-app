const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);
const abortError = () => { const error = new Error('Request cancelled.'); error.name = 'AbortError'; return error; };
const wait = (ms, signal) => new Promise((resolve, reject) => {
  if (signal && signal.aborted) return reject(abortError());
  const timer = setTimeout(() => { if (signal) signal.removeEventListener('abort', cancel); resolve(); }, ms);
  const cancel = () => { clearTimeout(timer); reject(abortError()); };
  if (signal) signal.addEventListener('abort', cancel, { once: true });
});

export async function requestJson(url, { signal, provider }) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController();
    const abortFromCaller = () => controller.abort();
    if (signal) {
      if (signal.aborted) abortFromCaller();
      else signal.addEventListener('abort', abortFromCaller, { once: true });
    }
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 15000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      let body;
      try { body = await response.json(); } catch { body = null; }
      if (!response.ok) {
        if (RETRYABLE_STATUSES.has(response.status) && attempt < 2) { await wait(500 * (attempt + 1), signal); continue; }
        const error = new Error((body && (body.message || body.error)) || `${provider} request failed (${response.status}).`);
        error.status = response.status;
        throw error;
      }
      if (body && body.success === false) throw new Error(body.message || `${provider} request failed.`);
      return body;
    } catch (error) {
      if (signal && signal.aborted) throw abortError();
      if (timedOut) {
        if (attempt < 2) { await wait(500 * (attempt + 1), signal); continue; }
        throw new Error(`${provider} request timed out. Please try again.`);
      }
      if (error.name === 'AbortError' || error.status) throw error;
      if (attempt < 2) { await wait(500 * (attempt + 1), signal); continue; }
      throw error;
    } finally {
      clearTimeout(timeout);
      if (signal) signal.removeEventListener('abort', abortFromCaller);
    }
  }
  throw new Error(`${provider} request failed. Please try again.`);
}
