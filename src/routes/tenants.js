const express = require('express');
const { tenants } = require('../data/store');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(tenants);
});

router.get('/:id', (req, res) => {
  const tenant = tenants.find((t) => t.id === req.params.id);
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found' });
  }
  res.json(tenant);
});

module.exports = router;
