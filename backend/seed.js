/*
  Seed script (insecure backend)
  - Idempotent: safe to run on every `npm start`
  - Creates demo users with PLAINTEXT passwords (intentionally insecure)
  - Creates a couple demo posts

  Skips automatically for tests / in-memory DB.
*/

const sqlite3 = require('sqlite3').verbose();

const DB_PATH = process.env.DB_PATH || './database.db';

if (process.env.NODE_ENV === 'test' || DB_PATH === ':memory:') {
  process.exit(0);
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Seed: could not connect to database', err);
    process.exit(1);
  }
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

async function ensureSchema() {
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
}

async function getOrCreateUser(username, plainPassword) {
  await run('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)', [username, plainPassword]);
  const row = await get('SELECT id FROM users WHERE username = ?', [username]);
  return row && row.id;
}

async function ensurePost(title, content) {
  const existing = await get('SELECT COUNT(1) AS c FROM posts WHERE title = ?', [title]);
  if (existing && existing.c > 0) return;
  // In insecure mode, posts are not owned/authenticated.
  await run('INSERT INTO posts (title, content) VALUES (?, ?)', [title, content]);
}

async function main() {
  await ensureSchema();

  await getOrCreateUser('demo1', 'password123');
  await getOrCreateUser('maze1', 'password123');

  await ensurePost('[DEMO] Welcome Post', 'This is seeded demo content (insecure mode).');
  await ensurePost('[DEMO] XSS Payload Example', '<img src=x onerror=alert(1) />');

  console.log('Seed: demo data ensured.');
}

main()
  .then(() => db.close(() => process.exit(0)))
  .catch((err) => {
    console.error('Seed: failed', err);
    db.close(() => process.exit(1));
  });
