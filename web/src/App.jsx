import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Mahasiswa from './pages/Mahasiswa.jsx';
import Tenant from './pages/Tenant.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="mahasiswa" element={<Mahasiswa />} />
        <Route path="tenant" element={<Tenant />} />
      </Route>
    </Routes>
  );
}
