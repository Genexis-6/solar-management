const KEY = 'sm_auth';
export const stored = { get: () => JSON.parse(localStorage.getItem(KEY) || 'null'), set: (v) => localStorage.setItem(KEY, JSON.stringify(v)), clear: () => localStorage.removeItem(KEY) };

async function call(method, path, body) {
  const a = stored.get();
  const r = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(a ? { Authorization: 'Bearer ' + a.token } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (r.status === 401 && a) { stored.clear(); window.dispatchEvent(new Event('logout')); throw new Error('Session expired'); }
  const data = r.status === 204 ? null : await r.json().catch(() => null);
  if (!r.ok) throw new Error((data && data.error) || 'Request failed (' + r.status + ')');
  return data;
}
export const api = {
  get: (p) => call('GET', p), post: (p, b) => call('POST', p, b), put: (p, b) => call('PUT', p, b),
  patch: (p, b) => call('PATCH', p, b || {}), del: (p) => call('DELETE', p),
};
