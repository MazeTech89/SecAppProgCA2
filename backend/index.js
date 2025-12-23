// SecureApp backend (Express + SQLite)
// Purpose: provide secure auth + CRUD endpoints used by the React frontend.
// Note: intentionally insecure endpoints are kept below but *deactivated* for coursework demos.

// --- Dependencies / middleware ---
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const morgan = require('morgan');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

// --- App + config ---
const app = express();
const PORT = process.env.PORT || 4000;
// Force IPv4 localhost by default (Windows often resolves `localhost` inconsistently between IPv4/IPv6).
const HOST = process.env.HOST || '127.0.0.1';
// JWT signing secret (use env var in real deployments; fallback is for local dev/testing only).
const SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// --- Security headers / transport hardening ---
app.use(helmet());

// --- CORS: allow the local React dev server to call the API with cookies (CSRF) ---
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// --- Request parsing + logging ---
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('combined'));

// --- CSRF protection (cookie-based, used on state-changing routes) ---
const csrfProtection = csrf({ cookie: true });

// Logout endpoint (stateless JWT): instruct client to remove token.
app.post('/logout', csrfProtection, (req, res) => {
  // For stateless JWT, just tell client to remove token
  res.json({ message: 'Logged out. Please remove token on client.' });
});

// --- SQLite database setup (used for users + blog posts) ---
const DB_PATH = process.env.DB_PATH || './database.db';
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite3 database.');
  }
});
db.serialize(() => {
  // User table: stores bcrypt password hash.
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
  // Blog post table: content is output-encoded on read to reduce XSS risk.
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


// --- Auth: register (hashed password + parameterized SQL) ---
app.post('/register', csrfProtection, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
    if (err) return res.status(400).json({ error: 'User already exists' });
    res.json({ id: this.lastID, username });
  });
});

// --- Auth: login (bcrypt verify + JWT issue) ---
app.post('/login', csrfProtection, (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
});



// --- Posts: create (auth + CSRF + parameterized SQL) ---
app.post('/posts', authenticateToken, csrfProtection, (req, res) => {
  const { title, content } = req.body;
  const user_id = req.user.id;
  if (!title || !content) return res.status(400).json({ error: 'Missing fields' });
  db.run('INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)', [user_id, title, content], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID, user_id, title, content });
  });
});



// --- Posts: read (auth + output encoding to reduce XSS risk) ---
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


// --- Posts: update (auth + CSRF + ownership check) ---
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


// --- Posts: delete (auth + CSRF + ownership check) ---
app.delete('/posts/:id', authenticateToken, csrfProtection, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM posts WHERE id = ? AND user_id = ?', [id, req.user.id], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Post not found or not owned' });
    res.json({ message: 'Post deleted', id });
  });
});

// --- Users: list (auth; returns minimal fields only) ---
app.get('/users', authenticateToken, (req, res) => {
  db.all('SELECT id, username FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// --- JWT authentication middleware (Authorization: Bearer <token>) ---
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

// CSRF token endpoint for the frontend to read and send back on POST/PUT/DELETE.
app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Centralized CSRF error handling.
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    // CSRF token errors
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next(err);
});

// Export for testing (Supertest) and for running as a standalone server.
module.exports = { app, db };

// Only bind to a port when executed directly (`node index.js`).
if (require.main === module) {
  const server = http.createServer(app);

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

  // Graceful shutdown during local dev.
  process.on('SIGINT', () => {
    server.close(() => {
      db.close(() => process.exit(0));
    });
  });
}
