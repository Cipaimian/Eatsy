const express = require('express');
const { orders } = require('../data/store');

const router = express.Router();

// GET /api/history/:studentId — riwayat order milik 1 mahasiswa
router.get('/:studentId', (req, res) => {
  const { studentId } = req.params;

  // ambil semua order milik studentId, terbaru dulu
  const result = orders
    .filter((o) => o.studentId === studentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // boleh array kosong kalau belum ada order
  res.json(result);
});

module.exports = router;
