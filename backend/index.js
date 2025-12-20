// Basic Express server setup for Secure Application Programming project
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 4000;
const SECRET = 'your_jwt_secret';

app.use(cors());
app.use(bodyParser.json());

// SQLite3 database setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite3 database.');
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
  // Blog post table for demonstration (with XSS and SQLi vulnerabilities in insecure branch)
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

// Insecure: Get all users (for demo purposes, no auth)
app.get('/insecure/users', (req, res) => {
  db.all('SELECT id, username FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Register endpoint (secure version)
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
    if (err) return res.status(400).json({ error: 'User already exists' });
    res.json({ id: this.lastID, username });
  });
});

// Login endpoint (secure version)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
});


// Insecure: Create post (vulnerable to SQL Injection)
app.post('/insecure/posts', (req, res) => {
  const { user_id, title, content } = req.body;
  // Vulnerable: direct string interpolation
  const sql = `INSERT INTO posts (user_id, title, content) VALUES (${user_id}, '${title}', '${content}')`;
  db.run(sql, function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID, user_id, title, content });
  });
});


// Insecure: Get all posts (vulnerable to stored XSS)
app.get('/insecure/posts', (req, res) => {
  db.all('SELECT * FROM posts', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Insecure: Edit post (vulnerable to SQL Injection)
app.put('/insecure/posts/:id', (req, res) => {
  const { title, content } = req.body;
  const { id } = req.params;
  // Vulnerable: direct string interpolation
  const sql = `UPDATE posts SET title = '${title}', content = '${content}' WHERE id = ${id}`;
  db.run(sql, function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id, title, content });
  });
});

// Insecure: Delete post (vulnerable to SQL Injection)
app.delete('/insecure/posts/:id', (req, res) => {
  const { id } = req.params;
  // Vulnerable: direct string interpolation
  const sql = `DELETE FROM posts WHERE id = ${id}`;
  db.run(sql, function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Post deleted', id });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
