const express = require('express');
const { feedback, orders } = require('../data/store');

const router = express.Router();

router.post('/', (req, res) => {
  const { orderId, rating, comment } = req.body;
  if (!orderId || rating === undefined || rating === null) {
    return res.status(400).json({ error: 'orderId and rating are required' });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
  }
  const order = orders.find((o) => o.id === orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'PICKED_UP') {
    return res.status(409).json({ error: 'Can only review an order after it is picked up' });
  }
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

router.get('/', (req, res) => {
  const { orderId } = req.query;
  res.json(orderId ? feedback.filter((f) => f.orderId === orderId) : feedback);
});

module.exports = router;
