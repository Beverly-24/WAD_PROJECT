const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', async (req, res) => {
  try {
    const { buyer_id, item_type, item_id, quantity, total_price, transaction_date } = req.body;
    const [result] = await db.query(
      'INSERT INTO transactions (buyer_id,item_type,item_id,quantity,total_price,transaction_date) VALUES (?,?,?,?,?,?)',
      [buyer_id, item_type, item_id, quantity, total_price, transaction_date]
    );
    res.json({ transaction_id: result.insertId });
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM transactions ORDER BY created_at DESC');
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
