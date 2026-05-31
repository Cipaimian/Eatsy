const express = require('express');
const { menus } = require('../data/store');

const router = express.Router();

router.get('/', (req, res) => {
  const { tenantId } = req.query;
  const result = tenantId ? menus.filter((m) => m.tenantId === tenantId) : menus;
  res.json(result);
});

router.patch('/:id', (req, res) => {
  const menu = menus.find((m) => m.id === req.params.id);
  if (!menu) {
    return res.status(404).json({ error: 'Menu not found' });
  }
  if (typeof req.body.available === 'boolean') {
    menu.available = req.body.available;
  }
  res.json(menu);
});

module.exports = router;
