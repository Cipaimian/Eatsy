import { Link } from 'react-router-dom';

const roles = [
  { to: '/mahasiswa', emoji: '🎓', title: 'Mahasiswa', desc: 'Browse menu, pesan, bayar, dan beri ulasan.' },
  { to: '/tenant', emoji: '🧑‍🍳', title: 'Tenant / Penjual', desc: 'Kelola menu dan proses pesanan masuk.' }
];

export default function Home() {
  return (
    <section style={{ textAlign: 'center' }}>
      <h2>Selamat Datang di Eatsy</h2>
      <p>Aplikasi pemesanan kantin online untuk meminimalkan antrean. Pilih peran Anda di bawah.</p>
      <div className="role-grid">
        {roles.map((r) => (
          <Link key={r.to} className="role-card" to={r.to}>
            <span className="emoji">{r.emoji}</span>
            <h3>{r.title}</h3>
            <p>{r.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
