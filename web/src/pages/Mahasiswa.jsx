import { useEffect, useState } from 'react';
import { api, rupiah } from '../lib/api.js';

export default function Mahasiswa() {
  const [studentId, setStudentId] = useState('stu1');
  const [tenants, setTenants] = useState([]);
  const [selected, setSelected] = useState(null); // { id, name }
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [history, setHistory] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api('/api/tenants').then(setTenants).catch((e) => setMsg(e.message));
  }, []);

  async function selectTenant(t) {
    setSelected({ id: t.id, name: t.name });
    setMenus(await api(`/api/menus?tenantId=${t.id}`));
  }

  function addToCart(menu) {
    // aturan 1 order = 1 tenant
    if (cart.length > 0 && cart[0].tenantId !== menu.tenantId) {
      if (!window.confirm('Keranjang berisi item dari tenant lain. Kosongkan dulu?')) return;
      setCart([{ menuId: menu.id, tenantId: menu.tenantId, name: menu.name, price: menu.price, qty: 1 }]);
      return;
    }
    setCart((prev) => {
      const found = prev.find((c) => c.menuId === menu.id);
      if (found) return prev.map((c) => (c.menuId === menu.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { menuId: menu.id, tenantId: menu.tenantId, name: menu.name, price: menu.price, qty: 1 }];
    });
  }

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  async function checkout() {
    try {
      const order = await api('/api/orders', {
        method: 'POST',
        body: { studentId, items: cart.map((c) => ({ menuId: c.menuId, qty: c.qty })) }
      });
      await api('/api/payments', { method: 'POST', body: { orderId: order.id, method: 'QRIS' } });
      setMsg(`✅ Order ${order.id} dibayar (${rupiah(order.total)})`);
      setCart([]);
      loadHistory();
    } catch (e) {
      setMsg('❌ ' + e.message);
    }
  }

  async function loadHistory() {
    setHistory(await api(`/api/history/${studentId}`));
  }

  async function submitFeedback(orderId, rating) {
    try {
      await api('/api/feedback', { method: 'POST', body: { orderId, rating: Number(rating) } });
      setMsg(`✅ Terima kasih atas ulasannya untuk ${orderId}`);
      loadHistory();
    } catch (e) {
      setMsg('❌ ' + e.message);
    }
  }

  return (
    <>
      <section>
        <label>NIM / Student ID: <input value={studentId} onChange={(e) => setStudentId(e.target.value)} /></label>
      </section>

      {msg && <p className="notice">{msg}</p>}

      <section>
        <h2>1. Pilih Tenant</h2>
        <div className="grid">
          {tenants.map((t) => (
            <div key={t.id} className={'card' + (t.open ? '' : ' disabled')} onClick={t.open ? () => selectTenant(t) : undefined}>
              <strong>{t.name}</strong><br /><small>{t.open ? '✅ Buka' : '❌ Tutup'}</small>
            </div>
          ))}
        </div>
      </section>

      {selected && (
        <section>
          <h2>2. Pilih Menu - {selected.name}</h2>
          <div className="grid">
            {menus.map((m) => (
              <div key={m.id} className={'card' + (m.available ? '' : ' disabled')} onClick={m.available ? () => addToCart(m) : undefined}>
                <strong>{m.name}</strong><br />{rupiah(m.price)}<br /><small>{m.available ? '➕ Tambah' : 'Habis'}</small>
              </div>
            ))}
          </div>
        </section>
      )}

      {cart.length > 0 && (
        <section>
          <h2>3. Keranjang</h2>
          <ul>
            {cart.map((c) => <li key={c.menuId}>{c.name} × {c.qty} = {rupiah(c.price * c.qty)}</li>)}
          </ul>
          <p><strong>Total: {rupiah(total)}</strong></p>
          <button onClick={checkout}>Checkout &amp; Bayar (QRIS)</button>
          <button className="secondary" onClick={() => setCart([])}>Kosongkan</button>
        </section>
      )}

      <section>
        <h2>4. Riwayat Pesanan <button className="secondary" onClick={loadHistory}>🔄 Muat</button></h2>
        <ul>
          {history.map((o) => (
            <li key={o.id}>
              <strong>{o.id}</strong> — {rupiah(o.total)} — {o.status}
              {o.status === 'PICKED_UP' && (
                <> {' '}
                  {/* TODO: ganti rating cepat ini dengan komponen bintang/komentar kalau mau lebih bagus */}
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button key={r} className="secondary" onClick={() => submitFeedback(o.id, r)}>{r}★</button>
                  ))}
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
