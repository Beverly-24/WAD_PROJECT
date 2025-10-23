const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [[{ total_crops }]] = await db.query('SELECT COUNT(*) AS total_crops FROM crops');
    const [[{ total_livestock }]] = await db.query('SELECT SUM(count) AS total_livestock FROM livestock');
    const [[{ projected_sales }]] = await db.query('SELECT SUM(quantity * price_per_kg) AS projected_sales FROM crops');

    res.json({
      total_crops,
      total_livestock: total_livestock || 0,
      projected_sales: projected_sales || 0
    });
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
