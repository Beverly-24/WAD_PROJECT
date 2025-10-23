const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', async (req, res) => {
  try {
    const { farmer_id, animal_type, count, price_per_animal } = req.body;
    const [result] = await db.query(
      'INSERT INTO livestock (farmer_id,animal_type,count,price_per_animal) VALUES (?,?,?,?)',
      [farmer_id || null, animal_type, count, price_per_animal]
    );
    res.json({ livestock_id: result.insertId });
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT l.*, f.name as farmer_name FROM livestock l LEFT JOIN farmers f ON l.farmer_id = f.farmer_id ORDER BY l.created_at DESC'
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
