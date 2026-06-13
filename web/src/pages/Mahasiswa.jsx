import { useEffect, useState } from 'react';
import { api, rupiah } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

function Notice({ msg, onDismiss }) {
  if (!msg) return null;
  const isError = msg.startsWith('❌') || msg.toLowerCase().includes('gagal');
  return (
    <div className={`notice ${isError ? 'error' : 'success'}`}>
      <span>{isError ? '❌' : '✅'}</span>
      <span style={{ flex: 1 }}>{msg.replace(/^[✅❌]\s*/, '')}</span>
      <button className="ghost sm" onClick={onDismiss} style={{ padding: '0 0.4rem' }}>✕</button>
    </div>
  );
}

function StarRating({ onRate }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>Beri ulasan:</span>
      <span className="star-row">
        {[1, 2, 3, 4, 5].map((r) => (
          <button
            key={r}
            className={`star-btn${r <= hovered ? ' filled' : ''}`}
            onMouseEnter={() => setHovered(r)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onRate(r)}
            title={`${r} bintang`}
          >★</button>
        ))}
      </span>
    </div>
  );
}

const STATUS_LABEL = {
  PENDING_PAYMENT: 'Menunggu Pembayaran',
  PAID:            'Sudah Dibayar',
  ACCEPTED:        'Diterima Tenant',
  REJECTED:        'Ditolak',
  READY:           'Siap Diambil',
  PICKED_UP:       'Sudah Diambil'
};

const STATUS_ICON = {
  PENDING_PAYMENT: '🕐',
  PAID:            '💳',
  ACCEPTED:        '✅',
  REJECTED:        '❌',
  READY:           '📦',
  PICKED_UP:       '🏃'
};

export default function Mahasiswa() {
  const { session } = useAuth();
  const studentId = session?.user?.refId || 'stu1';
  const userName  = session?.user?.name  || 'Mahasiswa';

  const [tenants,        setTenants]        = useState([]);
  const [selected,       setSelected]       = useState(null);
  const [menus,          setMenus]          = useState([]);
  const [cart,           setCart]           = useState([]);
  const [history,        setHistory]        = useState([]);
  const [feedbackDone,   setFeedbackDone]   = useState(new Set());
  const [msg,            setMsg]            = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [checkingOut,    setCheckingOut]    = useState(false);

  useEffect(() => {
    api('/api/tenants').then(setTenants).catch((e) => setMsg(e.message));
    loadHistory();
  }, []);

  async function selectTenant(t) {
    setSelected({ id: t.id, name: t.name });
    setMenus(await api(`/api/menus?tenantId=${t.id}`));
  }

  function addToCart(menu) {
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

  function changeQty(menuId, delta) {
    setCart((prev) => prev
      .map((c) => c.menuId === menuId ? { ...c, qty: c.qty + delta } : c)
      .filter((c) => c.qty > 0)
    );
  }

  const cartTotal   = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const cartCount   = cart.reduce((s, c) => s + c.qty, 0);

  async function checkout() {
    setCheckingOut(true);
    try {
      const order = await api('/api/orders', {
        method: 'POST',
        body: { studentId, items: cart.map((c) => ({ menuId: c.menuId, qty: c.qty })) }
      });
      await api('/api/payments', { method: 'POST', body: { orderId: order.id, method: 'QRIS' } });
      setMsg(`Order ${order.id} berhasil dibayar sebesar ${rupiah(order.total)}`);
      setCart([]);
      setSelected(null);
      await loadHistory();
    } catch (e) {
      setMsg('❌ ' + e.message);
    } finally {
      setCheckingOut(false);
    }
  }

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const data = await api(`/api/history/${studentId}`);
      setHistory(data);
      const doneIds = new Set(
        await api('/api/feedback').then((fb) => fb.map((f) => f.orderId)).catch(() => [])
      );
      setFeedbackDone(doneIds);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function submitFeedback(orderId, rating) {
    try {
      await api('/api/feedback', { method: 'POST', body: { orderId, rating: Number(rating) } });
      setMsg(`Ulasan ${rating} bintang berhasil dikirim. Terima kasih!`);
      setFeedbackDone((prev) => new Set([...prev, orderId]));
    } catch (e) {
      setMsg('❌ ' + e.message);
    }
  }

  return (
    <>
      <div className="page-title">
        <h2>Halo, {userName} 👋</h2>
        <p>Browse menu, pesan, bayar QRIS, dan pantau status pesananmu.</p>
      </div>

      <Notice msg={msg} onDismiss={() => setMsg('')} />

      <div className="step-flow">

        {/* Step 1 */}
        <div className="step-section">
          <div className="step-header">
            <div className="step-title">
              <span className="step-num">1</span>
              Pilih Tenant
            </div>
            {selected && (
              <button className="ghost sm" onClick={() => { setSelected(null); setMenus([]); }}>
                Ganti tenant
              </button>
            )}
          </div>
          <div className="step-body">
            {selected ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.25rem 0' }}>
                <span style={{ fontSize: '1.5rem' }}>🍜</span>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{selected.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 600 }}>Sedang buka</div>
                </div>
              </div>
            ) : (
              <div className="item-grid">
                {tenants.map((t) => (
                  <div
                    key={t.id}
                    className={`item-card${!t.open ? ' disabled' : ''}`}
                    onClick={t.open ? () => selectTenant(t) : undefined}
                  >
                    <div className="item-name">{t.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                      <span className={`item-status-dot${t.open ? '' : ' closed'}`} />
                      <span className="item-hint">{t.open ? 'Buka · Klik untuk lihat menu' : 'Sedang tutup'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step 2 */}
        {selected && (
          <div className="step-section">
            <div className="step-header">
              <div className="step-title">
                <span className="step-num">2</span>
                Menu {selected.name}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>Klik item untuk tambah ke keranjang</span>
            </div>
            <div className="step-body">
              <div className="item-grid">
                {menus.map((m) => {
                  const inCart = cart.find((c) => c.menuId === m.id);
                  return (
                    <div
                      key={m.id}
                      className={`item-card${!m.available ? ' disabled' : ''}${inCart ? ' active-tenant' : ''}`}
                      onClick={m.available ? () => addToCart(m) : undefined}
                    >
                      <div className="item-name">{m.name}</div>
                      <div className="item-price">{rupiah(m.price)}</div>
                      {m.available
                        ? inCart
                          ? <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: 4 }}>
                              <button className="qty-btn" onClick={(e) => { e.stopPropagation(); changeQty(m.id, -1); }}>−</button>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem', minWidth: 20, textAlign: 'center' }}>{inCart.qty}</span>
                              <button className="qty-btn" onClick={(e) => { e.stopPropagation(); changeQty(m.id, 1); }}>+</button>
                            </div>
                          : <div className="item-hint">Klik untuk tambah</div>
                        : <div className="item-hint">Stok habis</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {cart.length > 0 && (
          <div className="step-section">
            <div className="step-header">
              <div className="step-title">
                <span className="step-num">3</span>
                Keranjang
                <span className="cart-count-pill">{cartCount}</span>
              </div>
            </div>
            <div className="step-body">
              <div className="cart-list">
                {cart.map((c) => (
                  <div key={c.menuId} className="cart-item">
                    <span className="ci-name">{c.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button className="qty-btn" onClick={() => changeQty(c.menuId, -1)}>−</button>
                      <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{c.qty}</span>
                      <button className="qty-btn" onClick={() => changeQty(c.menuId, 1)}>+</button>
                    </div>
                    <span className="ci-amt">{rupiah(c.price * c.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="cart-total">
                <span>Total Pembayaran</span>
                <span>{rupiah(cartTotal)}</span>
              </div>
              <div className="cart-actions">
                <button onClick={checkout} disabled={checkingOut}>
                  {checkingOut ? 'Memproses...' : '💳 Checkout dan Bayar QRIS'}
                </button>
                <button className="secondary" onClick={() => setCart([])}>🗑 Kosongkan</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 */}
        <div className="step-section">
          <div className="step-header">
            <div className="step-title">
              <span className="step-num">4</span>
              Riwayat Pesanan
            </div>
            <button className="secondary sm" onClick={loadHistory} disabled={loadingHistory}>
              {loadingHistory ? 'Memuat...' : '🔄 Perbarui'}
            </button>
          </div>
          <div className="step-body">
            {history.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📋</span>
                <p style={{ fontWeight: 600 }}>Belum ada riwayat pesanan</p>
                <p style={{ fontSize: '0.78rem' }}>Buat pesanan di atas, lalu tekan Perbarui.</p>
              </div>
            ) : (
              <div className="history-list">
                {history.map((o) => (
                  <div key={o.id} className="history-card">
                    <div className="history-card-top">
                      <span style={{ fontSize: '1.4rem' }}>{STATUS_ICON[o.status] || '📄'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span className="hc-id">{o.id}</span>
                          <span className={`badge ${o.status}`}>{STATUS_LABEL[o.status] || o.status}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginTop: '0.2rem' }}>
                          {o.items?.map((i) => `${i.name} x${i.qty}`).join(', ')}
                        </div>
                      </div>
                      <span className="hc-amount">{rupiah(o.total)}</span>
                    </div>
                    {(o.status === 'READY' || o.status === 'PICKED_UP') && (
                      <div className="history-card-bottom">
                        {o.status === 'READY' && (
                          <span style={{ color: 'var(--purple)', fontWeight: 600 }}>
                            📦 Pesananmu siap! Segera ambil di tenant.
                          </span>
                        )}
                        {o.status === 'PICKED_UP' && (
                          feedbackDone.has(o.id)
                            ? <span style={{ color: 'var(--green)', fontWeight: 600 }}>⭐ Ulasan sudah dikirim. Terima kasih!</span>
                            : <StarRating onRate={(r) => submitFeedback(o.id, r)} />
                        )}
                      </div>
                    )}
                    {o.status === 'REJECTED' && (
                      <div className="history-card-bottom">
                        <span style={{ color: 'var(--red)', fontWeight: 600 }}>
                          Pesanan ditolak oleh tenant.
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
