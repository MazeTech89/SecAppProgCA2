
// ...existing code...
// ...existing code...
// ...existing code...
// Basic Express server setup for Secure Application Programming project

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const morgan = require('morgan');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 4000;
const SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

app.use(helmet()); // Security headers
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('combined')); // Logging

// CSRF protection (cookie-based)
const csrfProtection = csrf({ cookie: true });

// Logout endpoint (stateless JWT: instruct client to remove token)
app.post('/logout', csrfProtection, (req, res) => {
  // For stateless JWT, just tell client to remove token
  res.json({ message: 'Logged out. Please remove token on client.' });
});

// SQLite3 database setup
const DB_PATH = process.env.DB_PATH || './database.db';
const db = new sqlite3.Database(DB_PATH, (err) => {
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


/* ================= INSECURE ENDPOINTS (DEACTIVATED) =================
// To activate, comment out the secure endpoints and uncomment these.
// These endpoints demonstrate SQL Injection, XSS, and Sensitive Data Exposure;
//
// Insecure Register (no password hashing, no validation)
app.post('/insecure/register', (req, res) => {
  const { username, password } = req.body;
  db.run(`INSERT INTO users (username, password) VALUES ('${username}', '${password}')`, function(err) {
    if (err) return res.status(400).json({ error: 'User already exists' });
    res.json({ id: this.lastID, username });
  });
});

// Insecure Login (no password hashing, no rate limiting)
app.post('/insecure/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`, (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });
    // Insecure: returns user info directly
    res.json({ id: user.id, username: user.username });
  });
});

// Insecure: Create post (SQL Injection, no auth)
app.post('/insecure/posts', (req, res) => {
  const { user_id, title, content } = req.body;
  db.run(`INSERT INTO posts (user_id, title, content) VALUES (${user_id}, '${title}', '${content}')`, function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID, user_id, title, content });
  });
});

// Insecure: Get all posts (no output encoding, XSS risk)
app.get('/insecure/posts', (req, res) => {
  db.all('SELECT * FROM posts', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Insecure: Edit post (SQL Injection, no auth)
app.put('/insecure/posts/:id', (req, res) => {
  const { title, content } = req.body;
  const { id } = req.params;
  db.run(`UPDATE posts SET title = '${title}', content = '${content}' WHERE id = ${id}`,
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id, title, content });
    });
});

// Insecure: Delete post (SQL Injection, no auth)
app.delete('/insecure/posts/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM posts WHERE id = ${id}`, function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Post deleted', id });
  });
});

// Insecure: Get all users (no auth, exposes all user data)
app.get('/insecure/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
//
// ================= END INSECURE ENDPOINTS =================*/


// Register endpoint (secure version)
app.post('/register', csrfProtection, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
    if (err) return res.status(400).json({ error: 'User already exists' });
    res.json({ id: this.lastID, username });
  });
});

// Login endpoint (secure version)
app.post('/login', csrfProtection, (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
});



// Secure: Create post (uses parameterized queries)
app.post('/posts', authenticateToken, csrfProtection, (req, res) => {
  const { title, content } = req.body;
  const user_id = req.user.id;
  if (!title || !content) return res.status(400).json({ error: 'Missing fields' });
  db.run('INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)', [user_id, title, content], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID, user_id, title, content });
  });
});



// Secure: Get all posts (output encoding for XSS prevention)
app.get('/posts', authenticateToken, (req, res) => {
  db.all('SELECT * FROM posts', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Simple output encoding for demonstration
    const encode = (str) => String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const safeRows = rows.map(row => ({
      ...row,
      title: encode(row.title),
      content: encode(row.content)
    }));
    res.json(safeRows);
  });
});


// Secure: Edit post (uses parameterized queries)
app.put('/posts/:id', authenticateToken, csrfProtection, (req, res) => {
  const { title, content } = req.body;
  const { id } = req.params;
  if (!title || !content) return res.status(400).json({ error: 'Missing fields' });
  db.run('UPDATE posts SET title = ?, content = ? WHERE id = ? AND user_id = ?', [title, content, id, req.user.id], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Post not found or not owned' });
    res.json({ id, title, content });
  });
});


// Secure: Delete post (uses parameterized queries)
app.delete('/posts/:id', authenticateToken, csrfProtection, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM posts WHERE id = ? AND user_id = ?', [id, req.user.id], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Post not found or not owned' });
    res.json({ message: 'Post deleted', id });
  });
});

// Secure: Get all users (id and username only, requires authentication)
app.get('/users', authenticateToken, (req, res) => {
  db.all('SELECT id, username FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
// JWT authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// CSRF token endpoint for frontend (if needed)
app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    // CSRF token errors
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next(err);
});

module.exports = { app, db };

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
