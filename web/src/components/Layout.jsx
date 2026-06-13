import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const user = session?.user;

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const navLinks = user
    ? user.role === 'tenant'
      ? [{ to: '/tenant', label: 'Dashboard' }]
      : [{ to: '/mahasiswa', label: 'Pesan Makanan' }]
    : [
        { to: '/', label: 'Beranda', end: true },
        { to: '/mahasiswa', label: 'Mahasiswa' },
        { to: '/tenant', label: 'Tenant' }
      ];

  return (
    <>
      <header>
        <Link to="/" className="header-brand">
          <div className="logo-icon">🍽️</div>
          <h1>Eat<span>sy</span></h1>
        </Link>

        <nav>
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-user">
          {user ? (
            <>
              <div className="user-chip">
                <span className="user-avatar">{user.name[0].toUpperCase()}</span>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role === 'tenant' ? `Tenant${session.tenantName ? ` · ${session.tenantName}` : ''}` : 'Mahasiswa'}</span>
                </div>
              </div>
              <button className="secondary sm" onClick={handleLogout}>Keluar</button>
            </>
          ) : (
            <Link to="/login">
              <button>Masuk</button>
            </Link>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer>Eatsy &copy; {new Date().getFullYear()} &mdash; Kelompok III GSLC DevSecOps</footer>
    </>
  );
}
