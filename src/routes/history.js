const express = require('express');
const { orders } = require('../data/store');

const router = express.Router();

router.get('/:studentId', (req, res) => {
  const result = orders
    .filter((o) => o.studentId === req.params.studentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(result);
});

module.exports = router;
