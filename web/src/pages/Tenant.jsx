import { useEffect, useState } from 'react';
import { api, rupiah } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_FLOW = {
  PAID:     [
    { status: 'ACCEPTED', label: '✅ Terima', cls: '' },
    { status: 'REJECTED', label: '❌ Tolak',  cls: 'secondary' }
  ],
  ACCEPTED: [{ status: 'READY',     label: '📦 Siap Diambil',      cls: '' }],
  READY:    [{ status: 'PICKED_UP', label: '🏃 Konfirmasi Diambil', cls: '' }]
};

const STATUS_LABEL = {
  PENDING_PAYMENT: 'Menunggu Bayar',
  PAID:            'Sudah Dibayar',
  ACCEPTED:        'Diterima',
  REJECTED:        'Ditolak',
  READY:           'Siap Diambil',
  PICKED_UP:       'Sudah Diambil'
};

export default function Tenant() {
  const { session } = useAuth();
  const tenantId   = session?.user?.refId;
  const tenantName = session?.tenantName || 'Tenant';

  const [menus,      setMenus]      = useState([]);
  const [orders,     setOrders]     = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [msg,        setMsg]        = useState('');

  useEffect(() => { refresh(); }, []);

  async function refresh() {
    setRefreshing(true);
    try {
      const [m, o] = await Promise.all([
        api(`/api/menus?tenantId=${tenantId}`),
        api(`/api/orders?tenantId=${tenantId}`).catch(() => [])
      ]);
      setMenus(m);
      setOrders(o.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } finally {
      setRefreshing(false);
    }
  }

  async function toggle(menu) {
    await api(`/api/menus/${menu.id}`, { method: 'PATCH', body: { available: !menu.available } });
    refresh();
  }

  async function setStatus(orderId, status) {
    try {
      await api(`/api/orders/${orderId}/status`, { method: 'PATCH', body: { status } });
      setMsg(`Status order ${orderId} diperbarui ke ${STATUS_LABEL[status]}`);
      refresh();
    } catch (e) {
      setMsg('❌ ' + e.message);
    }
  }

  const activeOrders = orders.filter((o) => !['PICKED_UP', 'REJECTED'].includes(o.status));
  const doneOrders   = orders.filter((o) => ['PICKED_UP', 'REJECTED'].includes(o.status));

  const stats = {
    total:   orders.length,
    pending: orders.filter((o) => o.status === 'PAID').length,
    active:  activeOrders.filter((o) => o.status !== 'PAID').length,
    done:    orders.filter((o) => o.status === 'PICKED_UP').length,
    revenue: orders.filter((o) => o.status === 'PICKED_UP').reduce((s, o) => s + o.total, 0)
  };

  return (
    <>
      <div className="page-title">
        <h2>Dashboard {tenantName} 🧑‍🍳</h2>
        <p>Kelola menu dan proses pesanan masuk dari mahasiswa.</p>
      </div>

      {msg && (
        <div className={`notice ${msg.startsWith('❌') ? 'error' : 'success'}`} style={{ marginBottom: '1.25rem' }}>
          <span>{msg.startsWith('❌') ? '❌' : '✅'}</span>
          <span style={{ flex: 1 }}>{msg.replace(/^[✅❌]\s*/, '')}</span>
          <button className="ghost sm" onClick={() => setMsg('')} style={{ padding: '0 0.4rem' }}>✕</button>
        </div>
      )}

      {/* Stats strip */}
      <div className="stats-strip">
        <div className="stat-card">
          <span className="stat-icon">📥</span>
          <div>
            <div className="stat-val">{stats.pending}</div>
            <div className="stat-label">Pesanan Baru</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🍳</span>
          <div>
            <div className="stat-val">{stats.active}</div>
            <div className="stat-label">Sedang Diproses</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div>
            <div className="stat-val">{stats.done}</div>
            <div className="stat-label">Selesai Hari Ini</div>
          </div>
        </div>
        <div className="stat-card highlight">
          <span className="stat-icon">💰</span>
          <div>
            <div className="stat-val">{rupiah(stats.revenue)}</div>
            <div className="stat-label">Total Pendapatan</div>
          </div>
        </div>
      </div>

      {/* Pesanan Aktif */}
      <div className="step-section" style={{ marginBottom: '1.5rem' }}>
        <div className="step-header">
          <div className="step-title">
            <span className="step-num">📥</span>
            Pesanan Masuk
            {activeOrders.length > 0 && (
              <span className="cart-count-pill">{activeOrders.length}</span>
            )}
          </div>
          <button className="secondary sm" onClick={refresh} disabled={refreshing}>
            {refreshing ? 'Memuat...' : '🔄 Refresh'}
          </button>
        </div>
        {activeOrders.length === 0 ? (
          <div className="step-body">
            <div className="empty-state">
              <span className="empty-icon">🍽️</span>
              <p style={{ fontWeight: 600 }}>Belum ada pesanan aktif</p>
              <p style={{ fontSize: '0.78rem' }}>Pesanan baru dari mahasiswa akan muncul di sini.</p>
            </div>
          </div>
        ) : (
          <div style={{ padding: 0 }}>
            <div className="table-wrap" style={{ borderRadius: 0, border: 'none', borderTop: '1px solid var(--gray-100)' }}>
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Mahasiswa</th>
                    <th>Item Pesanan</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {activeOrders.map((o) => (
                    <tr key={o.id}>
                      <td><span className="order-mono">{o.id}</span></td>
                      <td style={{ fontWeight: 600 }}>{o.studentId}</td>
                      <td style={{ color: 'var(--gray-500)', fontSize: '0.82rem', maxWidth: 200 }}>
                        {o.items?.map((i) => `${i.name} x${i.qty}`).join(', ')}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--orange-dark)', whiteSpace: 'nowrap' }}>{rupiah(o.total)}</td>
                      <td><span className={`badge ${o.status}`}>{STATUS_LABEL[o.status] || o.status}</span></td>
                      <td>
                        <div className="action-group">
                          {(STATUS_FLOW[o.status] || []).map((a) => (
                            <button key={a.status} className={`sm ${a.cls}`} onClick={() => setStatus(o.id, a.status)}>
                              {a.label}
                            </button>
                          ))}
                          {!STATUS_FLOW[o.status] && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Tidak ada aksi</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Kelola Menu */}
      <div className="step-section" style={{ marginBottom: '1.5rem' }}>
        <div className="step-header">
          <div className="step-title">
            <span className="step-num">🍜</span>
            Kelola Menu
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>
            {menus.filter((m) => m.available).length} dari {menus.length} menu tersedia
          </span>
        </div>
        <div style={{ padding: 0 }}>
          <div className="table-wrap" style={{ borderRadius: 0, border: 'none', borderTop: '1px solid var(--gray-100)' }}>
            <table>
              <thead>
                <tr>
                  <th>Nama Menu</th>
                  <th>Harga</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {menus.length === 0
                  ? <tr><td colSpan={4}><div className="empty-state"><p>Tidak ada menu.</p></div></td></tr>
                  : menus.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td style={{ color: 'var(--orange-dark)', fontWeight: 600 }}>{rupiah(m.price)}</td>
                      <td>
                        <span className={`badge ${m.available ? 'available' : 'unavailable'}`}>
                          {m.available ? '🟢 Tersedia' : '🔴 Habis'}
                        </span>
                      </td>
                      <td>
                        <button className="sm secondary" onClick={() => toggle(m)}>
                          {m.available ? 'Set Habis' : 'Set Tersedia'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Riwayat */}
      {doneOrders.length > 0 && (
        <div className="step-section">
          <div className="step-header">
            <div className="step-title">
              <span className="step-num">📋</span>
              Riwayat Pesanan Selesai
            </div>
          </div>
          <div style={{ padding: 0 }}>
            <div className="table-wrap" style={{ borderRadius: 0, border: 'none', borderTop: '1px solid var(--gray-100)' }}>
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Mahasiswa</th>
                    <th>Item</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {doneOrders.map((o) => (
                    <tr key={o.id}>
                      <td><span className="order-mono">{o.id}</span></td>
                      <td>{o.studentId}</td>
                      <td style={{ color: 'var(--gray-500)', fontSize: '0.82rem' }}>
                        {o.items?.map((i) => `${i.name} x${i.qty}`).join(', ')}
                      </td>
                      <td style={{ fontWeight: 600 }}>{rupiah(o.total)}</td>
                      <td><span className={`badge ${o.status}`}>{STATUS_LABEL[o.status]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
