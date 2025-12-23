/*
  Seed script (secure backend)
  - Idempotent: safe to run on every `npm start`
  - Creates demo users with bcrypt-hashed passwords
  - Creates a couple demo posts owned by those users

  Skips automatically for tests / in-memory DB.
*/

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
}

async function getOrCreateUser(username, plainPassword) {
  const hash = bcrypt.hashSync(plainPassword, 10);
  await run('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)', [username, hash]);
  const row = await get('SELECT id FROM users WHERE username = ?', [username]);
  return row && row.id;
}

async function ensurePost(userId, title, content) {
  const existing = await get('SELECT COUNT(1) AS c FROM posts WHERE user_id = ? AND title = ?', [userId, title]);
  if (existing && existing.c > 0) return;
  await run('INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)', [userId, title, content]);
}

async function main() {
  await ensureSchema();

  const demoUsers = [
    { username: 'demo1', password: 'password123' },
    { username: 'maze1', password: 'password123' }
  ];

  for (const u of demoUsers) {
    const userId = await getOrCreateUser(u.username, u.password);
    if (!userId) continue;

    await ensurePost(
      userId,
      '[DEMO] Welcome Post',
      'This is seeded demo content (secure mode).'
    );

    await ensurePost(
      userId,
      '[DEMO] Security Notes',
      'Posts are output-encoded on read to reduce XSS risk.'
    );
  }

  console.log('Seed: demo data ensured.');
}

main()
  .then(() => db.close(() => process.exit(0)))
  .catch((err) => {
    console.error('Seed: failed', err);
    db.close(() => process.exit(1));
  });
