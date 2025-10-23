const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const [result] = await db.query(
      'INSERT INTO buyers (name,email,phone) VALUES (?,?,?)',
      [name, email, phone]
    );
    res.json({ buyer_id: result.insertId });
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM buyers ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
