// Port dari public/js/shared.js (window.Eatsy.api / rupiah).
// Same-origin: Express nyajiin API (/api/*) + static build di port yang sama.
export async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
