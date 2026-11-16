const DEFAULT_API_BASE = 'https://tire-special-website-production.up.railway.app';

/** Public browser adapter for the existing read-only tire search endpoint. */
export async function searchTires({ width, ratio, diameter }, { signal } = {}) {
  const base = (window.TS_API_BASE || DEFAULT_API_BASE).replace(/\/$/, '');
  const params = new URLSearchParams({ width, ratio, diameter });
  const response = await fetch(`${base}/api/tires/search?${params}`, { signal });
  let payload;
  try { payload = await response.json(); } catch { payload = null; }
  if (!response.ok) throw new Error(payload?.message || `Request failed (${response.status})`);
  if (!payload || !Array.isArray(payload.results)) throw new Error('The tire search returned an invalid response.');
  return payload;
}
