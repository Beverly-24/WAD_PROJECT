const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', async (req, res) => {
  try {
    const { farmer_id, crop_name, quantity, harvest_date, price_per_kg } = req.body;
    const [result] = await db.query(
      'INSERT INTO crops (farmer_id,crop_name,quantity,harvest_date,price_per_kg) VALUES (?,?,?,?,?)',
      [farmer_id || null, crop_name, quantity, harvest_date, price_per_kg]
    );
    res.json({ crop_id: result.insertId });
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT c.*, f.name as farmer_name FROM crops c LEFT JOIN farmers f ON c.farmer_id = f.farmer_id ORDER BY c.created_at DESC'
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
