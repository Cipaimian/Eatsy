// POST /api/orders bikin pesanan baru
// body: { studentId, items: [{ menuId, qty }] }
router.post('/', (req, res) => {
  const { studentId, items } = req.body;

  // validasi studentId ada, dan items array & tidak kosong
  if (!studentId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'studentId and a non-empty items array are required' });
  }

  // resolve tiap item ke menunya: menu harus ada & available
  const resolved = [];
  for (const item of items) {
    const qty = Number(item && item.qty);
    if (!item || !item.menuId || !Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ error: 'Each item needs a menuId and an integer qty >= 1' });
    }
    const menu = menus.find((m) => m.id === item.menuId);
    if (!menu) {
      return res.status(400).json({ error: `Menu ${item.menuId} not found` });
    }
    if (!menu.available) {
      return res.status(400).json({ error: `Menu ${menu.name} is not available` });
    }
    resolved.push({ menu, qty });
  }

  // semua item harus dari tenant yang sama (aturan: 1 order = 1 tenant)
  const tenantId = resolved[0].menu.tenantId;
  if (resolved.some((r) => r.menu.tenantId !== tenantId)) {
    return res.status(400).json({ error: 'All items in an order must come from the same tenant' });
  }

  // hitung total = sum(menu.price * qty)
  const total = resolved.reduce((sum, r) => sum + r.menu.price * r.qty, 0);

  const order = {
    id: `o${orders.length + 1}`,
    studentId,
    tenantId,
    items: resolved.map((r) => ({ menuId: r.menu.id, name: r.menu.name, price: r.menu.price, qty: r.qty })),
    total,
    status: 'PENDING_PAYMENT',
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  res.status(201).json(order);
});

// GET /api/orders, list semua order (boleh filter ?studentId= / ?tenantId=)
router.get('/', (req, res) => {
  const { studentId, tenantId } = req.query;
  let result = orders;
  if (studentId) {
    result = result.filter((o) => o.studentId === studentId);
  }
  if (tenantId) {
    result = result.filter((o) => o.tenantId === tenantId);
  }
  res.json(result);
});

// GET /api/orders/:id detail satu order
router.get('/:id', (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// PATCH /api/orders/:id/status tenant ubah status order
// body: { status }
router.patch('/:id/status', (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  const { status } = req.body;
  if (!ALLOWED_STATUS.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${ALLOWED_STATUS.join(', ')}` });
  }
  order.status = status;
  res.json(order);
});
