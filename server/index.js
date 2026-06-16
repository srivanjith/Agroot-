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

// Get profile details
app.get('/getProfile', (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(results[0]);
  });
});

// Update profile details with auto-migrations
app.post('/updateProfile', (req, res) => {
  const { email, name, phone, state, city } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  db.query("SHOW COLUMNS FROM users", (err, columns) => {
    if (err) {
      console.error("SHOW COLUMNS failed:", err);
      return res.status(500).json(err);
    }

    const hasColumn = (colName) => columns.some(c => c.Field.toLowerCase() === colName.toLowerCase());

    const alterQueries = [];
    if (!hasColumn('phone')) alterQueries.push("ALTER TABLE users ADD COLUMN phone VARCHAR(20)");
    if (!hasColumn('state')) alterQueries.push("ALTER TABLE users ADD COLUMN state VARCHAR(100)");
    if (!hasColumn('city')) alterQueries.push("ALTER TABLE users ADD COLUMN city VARCHAR(100)");

    const runAlters = (index) => {
      if (index >= alterQueries.length) {
        const updateQuery = `
          INSERT INTO users (name, email, phone, state, city)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            phone = VALUES(phone),
            state = VALUES(state),
            city = VALUES(city)
        `;
        db.query(updateQuery, [name || '', email, phone || '', state || '', city || ''], (updateErr, result) => {
          if (updateErr) {
            console.error("Profile SQL Insert/Update failed:", updateErr);
            return res.status(500).json(updateErr);
          }
          res.json({ message: "Profile saved successfully", result });
        });
        return;
      }

      db.query(alterQueries[index], (alterErr) => {
        if (alterErr) {
          console.error(`Alter query failed: ${alterQueries[index]}`, alterErr);
        }
        runAlters(index + 1);
      });
    };

    const hasUniqueEmail = columns.some(c => c.Field.toLowerCase() === 'email' && (c.Key === 'UNI' || c.Key === 'PRI'));
    if (!hasUniqueEmail) {
      db.query("ALTER TABLE users ADD UNIQUE (email)", (uniqueErr) => {
        if (uniqueErr) {
          console.error("Adding unique constraint on email failed:", uniqueErr);
        }
        runAlters(0);
      });
    } else {
      runAlters(0);
    }
  });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
