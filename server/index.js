const express = require('express');
const cors = require('cors');
const db = require('./db');

db.query('SELECT * FROM users', (err, results) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(results);
});

const app = express();

app.use(cors());
app.use(express.json());

app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
});

app.post('/saveUser', (req, res) => {
  const { uid, email } = req.body;
  
  if (!uid || !email) {
    return res.status(400).json({ error: "Missing uid or email" });
  }

  const query = 'INSERT INTO users (uid, email) VALUES (?, ?) ON DUPLICATE KEY UPDATE email = VALUES(email)';
  
  db.query(query, [uid, email], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(200).json({ message: "User saved successfully", result });
  });
});

// Add user
app.post("/users", (req, res) => {
  const { name, email } = req.body;

  const sql = "INSERT INTO users (name, email) VALUES (?, ?)";

  db.query(sql, [name, email], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    res.json({
      message: "User added successfully",
      id: result.insertId
    });
  });
});

// Add machine
app.post("/machines", (req, res) => {
  const { name, type, price, image, location, available, ownerId } = req.body;
  const sql = "INSERT INTO machines (name, type, price, image, location, available, ownerId) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(sql, [name, type, price, image, location, available, ownerId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Machine added successfully", id: result.insertId });
  });
});

// Get machines
app.get("/machines", (req, res) => {
  db.query("SELECT * FROM machines", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// Add seed
app.post("/seeds", (req, res) => {
  const { name, season, description, price, image, ownerId } = req.body;
  const sql = "INSERT INTO seeds (name, season, description, price, image, ownerId) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [name, season, description, price, image, ownerId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Seed added successfully", id: result.insertId });
  });
});

// Get seeds
app.get("/seeds", (req, res) => {
  db.query("SELECT * FROM seeds", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
