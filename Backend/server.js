/**
 * FarmTracker backend - Node.js + Express + MySQL
 * Update the `dbConfig` object with your MySQL credentials.
 */

const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// === UPDATE with your MySQL credentials ===
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'farm_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Helper to get connection
async function getConn() {
  return mysql.createPool(dbConfig);
}

// --- Farmers ---
app.post('/api/farmers', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const pool = await getConn();
    const [result] = await pool.query('INSERT INTO farmers (name,email,phone) VALUES (?,?,?)', [name,email,phone]);
    res.json({ farmer_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.get('/api/farmers', async (req, res) => {
  try {
    const pool = await getConn();
    const [rows] = await pool.query('SELECT * FROM farmers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// --- Crops ---
app.post('/api/crops', async (req, res) => {
  try {
    const { farmer_id, crop_name, quantity, harvest_date, price_per_kg } = req.body;
    const pool = await getConn();
    const [result] = await pool.query('INSERT INTO crops (farmer_id,crop_name,quantity,harvest_date,price_per_kg) VALUES (?,?,?,?,?)',
      [farmer_id || null, crop_name, quantity, harvest_date, price_per_kg]);
    res.json({ crop_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.get('/api/crops', async (req, res) => {
  try {
    const pool = await getConn();
    const [rows] = await pool.query('SELECT c.*, f.name as farmer_name FROM crops c LEFT JOIN farmers f ON c.farmer_id = f.farmer_id ORDER BY c.created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// --- Livestock ---
app.post('/api/livestock', async (req, res) => {
  try {
    const { farmer_id, animal_type, count, price_per_animal } = req.body;
    const pool = await getConn();
    const [result] = await pool.query('INSERT INTO livestock (farmer_id,animal_type,count,price_per_animal) VALUES (?,?,?,?)',
      [farmer_id || null, animal_type, count, price_per_animal]);
    res.json({ livestock_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.get('/api/livestock', async (req, res) => {
  try {
    const pool = await getConn();
    const [rows] = await pool.query('SELECT l.*, f.name as farmer_name FROM livestock l LEFT JOIN farmers f ON l.farmer_id = f.farmer_id ORDER BY l.created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// --- Buyers ---
app.post('/api/buyers', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const pool = await getConn();
    const [result] = await pool.query('INSERT INTO buyers (name,email,phone) VALUES (?,?,?)', [name,email,phone]);
    res.json({ buyer_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.get('/api/buyers', async (req, res) => {
  try {
    const pool = await getConn();
    const [rows] = await pool.query('SELECT * FROM buyers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// --- Transactions ---
app.post('/api/transactions', async (req, res) => {
  try {
    const { buyer_id, item_type, item_id, quantity, total_price, transaction_date } = req.body;
    const pool = await getConn();
    const [result] = await pool.query('INSERT INTO transactions (buyer_id,item_type,item_id,quantity,total_price,transaction_date) VALUES (?,?,?,?,?,?)',
      [buyer_id, item_type, item_id, quantity, total_price, transaction_date]);
    res.json({ transaction_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.get('/api/summary', async (req, res) => {
  try {
    const pool = await getConn();
    const [[{ total_crops }]] = await pool.query('SELECT COUNT(*) as total_crops FROM crops');
    const [[{ total_livestock }]] = await pool.query('SELECT SUM(count) as total_livestock FROM livestock');
    const [[{ projected_sales }]] = await pool.query('SELECT SUM(quantity*price_per_kg) as projected_sales FROM crops');
    res.json({ total_crops, total_livestock: total_livestock||0, projected_sales: projected_sales||0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('FarmTracker API running on port', PORT));
