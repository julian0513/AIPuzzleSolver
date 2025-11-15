// services/apiClient.jsx
const RAW_BASE = import.meta.env.VITE_API_BASE ?? '/api/puzzle';
export const API_BASE = String(RAW_BASE).replace(/\/+$/, ''); // strip trailing slash

const isAbs = (u) => /^https?:\/\//i.test(u);
const join = (base, path) => (isAbs(path) ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`);

async function parseBody(res) {
  if (res.status === 204) return null;
  const ct = (res.headers.get('content-type') || '').toLowerCase();
  const text = await res.text();
  if (!text) return null;
  if (ct.includes('application/json')) {
    try { return JSON.parse(text); } catch { /* fallthrough to text */ }
  }
  return text;
}

function qstr(query) {
  if (!query) return '';
  const s = new URLSearchParams(query).toString();
  return s ? `?${s}` : '';
}

async function request(method, path, { body, headers = {}, query, timeout = 10000, signal } = {}) {
  // Single controller handles both external abort and timeout
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(new Error('timeout')), timeout);

  if (signal) {
    if (signal.aborted) ctrl.abort(signal.reason);
    else signal.addEventListener('abort', () => ctrl.abort(signal.reason), { once: true });
  }

  try {
    const isForm = body instanceof FormData;
    const isString = typeof body === 'string';
    const finalBody = body != null && !isForm && !isString ? JSON.stringify(body) : body;

    const res = await fetch(join(API_BASE, path) + qstr(query), {
      method,
      headers: {
        Accept: 'application/json, text/plain;q=0.9,*/*;q=0.8',
        ...headers,
        ...(finalBody != null && !isForm && !isString ? { 'Content-Type': 'application/json' } : {}),
      },
      body: finalBody,
      signal: ctrl.signal,
      // credentials: 'include', // enable if you need cookies
    });

    const data = await parseBody(res);
    if (!res.ok) {
      const err = new Error(typeof data === 'string' ? data : (data?.message || res.statusText));
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } catch (e) {
    // Normalize AbortError surface a bit
    if (e.name === 'AbortError') {
      const err = new Error(e.message || 'Request aborted');
      err.aborted = true;
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export const get  = (path, opts) => request('GET', path, opts);
export const post = (path, body, opts) => request('POST', path, { ...opts, body });
export const put  = (path, body, opts) => request('PUT', path, { ...opts, body });
export const del  = (path, opts) => request('DELETE', path, opts);
