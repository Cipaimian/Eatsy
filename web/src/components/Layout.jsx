import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/mahasiswa', label: 'Mahasiswa' },
  { to: '/tenant', label: 'Tenant' }
];

export default function Layout() {
  return (
    <>
      <header>
        <h1>🍽️ Eatsy</h1>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>Eatsy &copy; Kelompok III</footer>
    </>
  );
}
