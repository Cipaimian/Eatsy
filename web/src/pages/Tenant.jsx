import { useEffect, useState } from 'react';
import { api, rupiah } from '../lib/api.js';

// transisi status yang boleh dilakuin tenant (samain sama ALLOWED_STATUS di routes/orders.js)
const ACTIONS = ['ACCEPTED', 'REJECTED', 'READY', 'PICKED_UP'];

export default function Tenant() {
  const [tenants, setTenants] = useState([]);
  const [tenantId, setTenantId] = useState('');
  const [menus, setMenus] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api('/api/tenants').then((ts) => {
      setTenants(ts);
      if (ts[0]) setTenantId(ts[0].id);
    });
  }, []);

  useEffect(() => {
    if (tenantId) refresh();
  }, [tenantId]);

  async function refresh() {
    setMenus(await api(`/api/menus?tenantId=${tenantId}`));
    // GET /api/orders?tenantId= — butuh routes/orders.js udah ke-mount
    setOrders(await api(`/api/orders?tenantId=${tenantId}`).catch(() => []));
  }

  async function toggle(menu) {
    await api(`/api/menus/${menu.id}`, { method: 'PATCH', body: { available: !menu.available } });
    refresh();
  }

  async function setStatus(orderId, status) {
    await api(`/api/orders/${orderId}/status`, { method: 'PATCH', body: { status } });
    refresh();
  }

  return (
    <>
      <section>
        <label>Pilih tenant Anda:{' '}
          <select value={tenantId} onChange={(e) => setTenantId(e.target.value)}>
            {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <button onClick={refresh}>🔄 Refresh</button>
      </section>

      <section>
        <h2>Kelola Menu</h2>
        <table>
          <thead><tr><th>Menu</th><th>Harga</th><th>Tersedia</th><th>Aksi</th></tr></thead>
          <tbody>
            {menus.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{rupiah(m.price)}</td>
                <td>{m.available ? '✅' : '❌'}</td>
                <td><button onClick={() => toggle(m)}>{m.available ? 'Set Habis' : 'Set Tersedia'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Pesanan Masuk</h2>
        <table>
          <thead><tr><th>Order</th><th>Mahasiswa</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.studentId}</td>
                <td>{rupiah(o.total)}</td>
                <td>{o.status}</td>
                <td>
                  {ACTIONS.map((s) => (
                    <button key={s} className="secondary" onClick={() => setStatus(o.id, s)}>{s}</button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
