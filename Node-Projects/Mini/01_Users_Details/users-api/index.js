const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.json());

const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('Database open error', err);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact TEXT,
    email TEXT,
    firstname TEXT,
    lastname TEXT,
    address TEXT,
    line1 TEXT,
    line2 TEXT,
    country TEXT,
    state TEXT,
    apartment TEXT
  )`);
});

app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/users/:id', (req, res) => {
  db.get('SELECT * FROM users WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).send('User not found');
    res.json(row);
  });
});

app.post('/users', (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'JSON body required' });
  }
  const { contact, email, firstname, lastname, address, line1, line2, country, state, apartment } = req.body;
  const sql = `INSERT INTO users
    (contact, email, firstname, lastname, address, line1, line2, country, state, apartment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [contact, email, firstname, lastname, address, line1, line2, country, state, apartment], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({
      id: this.lastID,
      contact, email, firstname, lastname, address, line1, line2, country, state, apartment
    });
  });
});

app.put('/users/:id', (req, res) => {
  const { contact, email, firstname, lastname, address, line1, line2, country, state, apartment } = req.body;
  const sql = `UPDATE users SET
    contact = ?, email = ?, firstname = ?, lastname = ?, address = ?,
    line1 = ?, line2 = ?, country = ?, state = ?, apartment = ?
    WHERE id = ?`;
  db.run(sql, [contact, email, firstname, lastname, address, line1, line2, country, state, apartment, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).send('User not found');
    res.json({ id: parseInt(req.params.id), contact, email, firstname, lastname, address, line1, line2, country, state, apartment });
  });
});


// DELETE /users/:id
app.delete('/users/:id', (req, res) => {
  const sql = 'DELETE FROM users WHERE id = ?';
  db.run(sql, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).send('User not found');
    res.status(204).send(); // No content on successful delete
  });
});


app.listen(3000, () => console.log('Server running on http://localhost:3000'));


app.use(express.static('public'));







































