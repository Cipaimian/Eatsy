const express = require('express');
const { payments, orders } = require('../data/store');

const router = express.Router();

// POST /api/payments — bayar sebuah order
// body: { orderId, method }   (method contoh: 'QRIS' | 'CASH' | 'EWALLET')
router.post('/', (req, res) => {
  const { orderId, method } = req.body;

  // validasi orderId & method ada
  if (!orderId || !method) {
    return res.status(400).json({ error: 'orderId and method are required' });
  }

  // cari order
  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // order harus masih nunggu bayar
  if (order.status !== 'PENDING_PAYMENT') {
    return res.status(409).json({ error: `Order is not awaiting payment (status: ${order.status})` });
  }

  // catat pembayaran
  const payment = {
    id: `p${payments.length + 1}`,
    orderId,
    method,
    amount: order.total,
    paidAt: new Date().toISOString()
  };
  payments.push(payment);

  // flip status order -> PAID
  order.status = 'PAID';
  res.status(201).json(payment);
});

// GET /api/payments — list pembayaran (boleh filter ?orderId=)
router.get('/', (req, res) => {
  const { orderId } = req.query;
  const result = orderId ? payments.filter((p) => p.orderId === orderId) : payments;
  res.json(result);
});

module.exports = router;
