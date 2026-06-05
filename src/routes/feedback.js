const express = require('express');
const { feedback, orders } = require('../data/store');

const router = express.Router();

// POST /api/feedback — kasih rating ke sebuah order
// body: { orderId, rating, comment }
router.post('/', (req, res) => {
  const { orderId, rating, comment } = req.body;

  // validasi orderId & rating ada
  if (!orderId || rating === undefined || rating === null) {
    return res.status(400).json({ error: 'orderId and rating are required' });
  }

  // rating harus integer 1..5
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
  }

  // order harus beneran ada
  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // cuma boleh review setelah pesanan diambil
  if (order.status !== 'PICKED_UP') {
    return res.status(409).json({ error: 'Can only review an order after it is picked up' });
  }

  // cegah double-review untuk orderId yang sama
  if (feedback.some((f) => f.orderId === orderId)) {
    return res.status(409).json({ error: 'This order already has feedback' });
  }

  const fb = {
    id: `f${feedback.length + 1}`,
    orderId,
    rating,
    comment: comment || '',
    createdAt: new Date().toISOString()
  };
  feedback.push(fb);
  res.status(201).json(fb);
});

// GET /api/feedback — list feedback (boleh filter ?orderId=)
router.get('/', (req, res) => {
  const { orderId } = req.query;
  const result = orderId ? feedback.filter((f) => f.orderId === orderId) : feedback;
  res.json(result);
});

module.exports = router;
