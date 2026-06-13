const express = require('express');
const { payments, orders } = require('../data/store');

const router = express.Router();

router.post('/', (req, res) => {
  const { orderId, method } = req.body;
  if (!orderId || !method) {
    return res.status(400).json({ error: 'orderId and method are required' });
  }
  const order = orders.find((o) => o.id === orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'PENDING_PAYMENT') {
    return res.status(409).json({ error: `Order is not awaiting payment (status: ${order.status})` });
  }

  const payment = {
    id: `p${payments.length + 1}`,
    orderId,
    method,
    amount: order.total,
    paidAt: new Date().toISOString()
  };
  payments.push(payment);
  order.status = 'PAID';
  res.status(201).json(payment);
});

router.get('/', (req, res) => {
  const { orderId } = req.query;
  res.json(orderId ? payments.filter((p) => p.orderId === orderId) : payments);
});

module.exports = router;
