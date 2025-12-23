// InsecureApp backend (Express + SQLite)
// Purpose: intentionally vulnerable API used to demonstrate OWASP issues (SQLi/XSS/sensitive data exposure).
// Note: the secure implementation lives on the `main` branch; this branch keeps the unsafe behavior for screenshots/testing.
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '127.0.0.1';
const DB_PATH = process.env.DB_PATH || './database.db';
// Demo-only fallback; prefer env var (also used by tests).
const SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Allow credentials for cookie-based CSRF when not using CRA proxy.
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

// SQLite3 database setup (users + posts).
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
  // Posts table used by the blog demo.
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});



// ================= SWITCHING SECURE/INSECURE =================
// Only ONE block should be active at a time.
// - Secure mode: keep the SECURE block uncommented (default in this file).
// - Insecure mode: comment the SECURE block and uncomment the INSECURE block.

// ================= INSECURE ENDPOINTS (INACTIVE) =================
// Uncomment this whole block for insecure mode.
/*

// Insecure: register (stores passwords in plaintext; minimal validation).
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function(err) {
    if (err) return res.status(400).json({ error: 'User already exists' });
    res.json({ id: this.lastID, username });
  });
});

// Insecure: login (compares plaintext; no JWT/session is issued).
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });
    if (password !== user.password) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ message: 'Login successful', id: user.id, username: user.username });
  });
});

// Insecure: create post
// Vulnerable: SQL injection (string concatenation) + no auth/CSRF.
app.post('/posts', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Missing fields' });
  const sql = `INSERT INTO posts (title, content) VALUES ('${title}', '${content}')`;
  db.run(sql, function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID, title, content });
  });
});

// Insecure: read posts
// Vulnerable: returns raw content; frontend renders as HTML (XSS possible).
app.get('/posts', (req, res) => {
  db.all('SELECT * FROM posts', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Insecure: update post
// Vulnerable: SQL injection (string concatenation) + no auth/CSRF.
app.put('/posts/:id', (req, res) => {
  const { title, content } = req.body;
  const { id } = req.params;
  if (!title || !content) return res.status(400).json({ error: 'Missing fields' });
  const sql = `UPDATE posts SET title = '${title}', content = '${content}' WHERE id = ${id}`;
  db.run(sql, function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id, title, content });
  });
});

// Insecure: delete post
// Vulnerable: SQL injection via path parameter.
app.delete('/posts/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM posts WHERE id = ${id}`;
  db.run(sql, function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Post deleted', id });
  });
});

*/

// ================= SECURE ENDPOINTS (ACTIVE) =================
// Comment out this whole block for insecure mode.

// CSRF protection (cookie-based)
const cookieParser = require('cookie-parser');
const csurf = require('csurf');

app.use(cookieParser());
app.use(csurf({
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false
  }
}));

app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use((err, req, res, next) => {
  if (err && err.code === 'EBADCSRFTOKEN') return res.status(403).json({ error: 'Invalid CSRF token' });
  return next(err);
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

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Secure: Create post (parameterized, requires auth)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Secure: list users (id + username only)
app.get('/users', authenticateToken, (req, res) => {
  db.all('SELECT id, username FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Secure: logout (stateless JWT; no-op, but kept for UX/tests)
app.post('/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

app.post('/posts', authenticateToken, (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.id;
  if (!title || !content) return res.status(400).json({ error: 'Missing fields' });
  db.run('INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)', [title, content, userId], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID, title, content });
  });
});

// Secure: Get all posts (output encoding, requires auth)
app.get('/posts', authenticateToken, (req, res) => {
  db.all('SELECT * FROM posts', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const encoded = rows.map((p) => ({
      ...p,
      title: escapeHtml(p.title),
      content: escapeHtml(p.content)
    }));
    res.json(encoded);
  });
});

// Secure: Edit post (parameterized, requires auth)
app.put('/posts/:id', authenticateToken, (req, res) => {
  const { title, content } = req.body;
  const { id } = req.params;
  if (!title || !content) return res.status(400).json({ error: 'Missing fields' });
  db.run('UPDATE posts SET title = ?, content = ? WHERE id = ? AND user_id = ?', [title, content, id, req.user.id], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Post not found' });
    res.json({ id, title, content });
  });
});

// Secure: Delete post (parameterized, requires auth)
app.delete('/posts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM posts WHERE id = ? AND user_id = ?', [id, req.user.id], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted', id });
  });
});






// --- Server start (with friendly port-in-use handling) ---
// Start only when run directly (not when imported by Jest).
let server;

function startServer() {
  // Use an explicit HTTP server so we can register the error handler before binding the port.
  server = http.createServer(app);

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`\nPort ${PORT} is already in use.`);
      console.error('Stop the other backend instance, or start this one with a different port, e.g.:');
      console.error('  $env:PORT=4001; npm start');
      console.error('On Windows you can find/kill the process with:');
      console.error(`  netstat -ano | findstr ":${PORT}"`);
      console.error('  taskkill /PID <pid> /F\n');
      process.exit(1);
    }

    console.error('Server failed to start:', err);
    process.exit(1);
  });

  server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

if (require.main === module) {
  startServer();

  process.on('SIGINT', () => {
    if (!server) return;
    server.close(() => {
      db.close(() => process.exit(0));
    });
  });
}

module.exports = { app, db, startServer };
