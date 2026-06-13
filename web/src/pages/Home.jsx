import { Link } from 'react-router-dom';

const roles = [
  {
    to: '/mahasiswa',
    icon: '🎓',
    title: 'Mahasiswa',
    desc: 'Browse menu tenant, tambahkan ke keranjang, bayar via QRIS, pantau status, dan beri ulasan.',
    cta: 'Mulai pesan'
  },
  {
    to: '/tenant',
    icon: '🧑‍🍳',
    title: 'Tenant',
    desc: 'Kelola ketersediaan menu, terima atau tolak pesanan masuk, dan konfirmasi pengambilan.',
    cta: 'Kelola toko'
  }
];

const features = [
  { icon: '⚡', label: 'Pesan Cepat', desc: 'Tidak perlu antre panjang di kantin' },
  { icon: '💳', label: 'Bayar QRIS', desc: 'Pembayaran digital yang mudah dan aman' },
  { icon: '📦', label: 'Pantau Status', desc: 'Notifikasi real-time dari dapur ke tanganmu' }
];

export default function Home() {
  return (
    <>
      <div className="home-hero">
        <div className="home-badge">✨ Kantin Digital Kampus</div>
        <h2>Pesan makan <span>tanpa antre</span>, makan tepat waktu.</h2>
        <p>Eatsy menghubungkan mahasiswa dengan tenant kantin kampus untuk pengalaman makan siang yang lebih efisien.</p>
        <div className="role-grid">
          {roles.map((r) => (
            <Link key={r.to} className="role-card" to={r.to}>
              <div className="card-icon">{r.icon}</div>
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
              <span className="card-arrow">{r.cta} →</span>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        {features.map((f) => (
          <div key={f.label} style={{
            background: 'white',
            border: '1.5px solid var(--gray-200)',
            borderRadius: 'var(--radius)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>{f.icon}</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--gray-900)' }}>{f.label}</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{f.desc}</span>
          </div>
        ))}
      </div>
    </>
  );
}
