const express = require('express');
const { users, tenants } = require('../data/store');

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi' });
  }
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Email atau password salah' });
  }
  const { password: _pw, ...safe } = user; // eslint-disable-line no-unused-vars
  const tenant = user.role === 'tenant' ? tenants.find((t) => t.id === user.refId) : null;
  res.json({ user: safe, tenantName: tenant ? tenant.name : null });
});

router.post('/register', (req, res) => {
  const { name, email, password, role, tenantId } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  }
  if (!['mahasiswa', 'tenant'].includes(role)) {
    return res.status(400).json({ error: 'Role tidak valid' });
  }
  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ error: 'Email sudah terdaftar' });
  }
  if (role === 'tenant') {
    if (!tenantId) return res.status(400).json({ error: 'Pilih tenant yang dikelola' });
    if (!tenants.find((t) => t.id === tenantId)) {
      return res.status(400).json({ error: 'Tenant tidak ditemukan' });
    }
    if (users.find((u) => u.role === 'tenant' && u.refId === tenantId)) {
      return res.status(409).json({ error: 'Tenant ini sudah memiliki akun' });
    }
  }

  const refId = role === 'mahasiswa'
    ? `stu${users.filter((u) => u.role === 'mahasiswa').length + 1}`
    : tenantId;

  const user = { id: `u${users.length + 1}`, name, email, password, role, refId };
  users.push(user);

  const { password: _pw, ...safe } = user; // eslint-disable-line no-unused-vars
  const tenant = role === 'tenant' ? tenants.find((t) => t.id === tenantId) : null;
  res.status(201).json({ user: safe, tenantName: tenant ? tenant.name : null });
});

router.get('/tenants', (req, res) => {
  const taken = new Set(users.filter((u) => u.role === 'tenant').map((u) => u.refId));
  res.json(tenants.filter((t) => !taken.has(t.id)));
});

module.exports = router;
