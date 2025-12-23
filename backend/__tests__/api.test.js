// Backend API tests (secure branch / main)
// Goal: validate the secure controls expected by the use-cases (CSRF, JWT auth, output encoding, ownership checks).
const request = require('supertest');

// Force an in-memory DB so tests are isolated and repeatable.
process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test_secret';

// Import the Express app without binding a real network port.
const { app, db } = require('../index');

// Helpers: reduce duplication across test cases.
function uniqueUsername(prefix = 'user') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

// Get a valid CSRF token for state-changing requests.
async function getCsrf(agent) {
  const res = await agent.get('/csrf-token').expect(200);
  expect(res.body).toHaveProperty('csrfToken');
  expect(typeof res.body.csrfToken).toBe('string');
  expect(res.body.csrfToken.length).toBeGreaterThan(10);
  return res.body.csrfToken;
}

// Register a user (requires CSRF).
function register(agent, { username, password, csrfToken }) {
  return agent
    .post('/register')
    .set('X-CSRF-Token', csrfToken)
    .send({ username, password });
}

// Log in and obtain a JWT (requires CSRF).
function login(agent, { username, password, csrfToken }) {
  return agent
    .post('/login')
    .set('X-CSRF-Token', csrfToken)
    .send({ username, password });
}

afterAll((done) => {
  // Close SQLite connection to avoid Jest hanging.
  db.close(done);
});

describe('SecureApp API (use-case derived)', () => {
  test('TP-UC1-N-01 Register (normal): creates user and stores hashed password', async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrf(agent);

    const username = uniqueUsername('reg');
    const password = 'P@ssw0rd123';

    const res = await register(agent, { username, password, csrfToken }).expect(200);
    expect(res.body).toMatchObject({ username });
    expect(res.body).toHaveProperty('id');

    // Verify stored password != plaintext (bcrypt hash)
    await new Promise((resolve, reject) => {
      db.get('SELECT password FROM users WHERE username = ?', [username], (err, row) => {
        if (err) return reject(err);
        expect(row).toBeTruthy();
        expect(row.password).toBeTruthy();
        expect(row.password).not.toBe(password);
        resolve();
      });
    });
  });

  test('TP-UC1-A-01 Register (alternate 3a): missing fields -> 400', async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrf(agent);

    await agent
      .post('/register')
      .set('X-CSRF-Token', csrfToken)
      .send({ username: '', password: '' })
      .expect(400);
  });

  test('TP-UC1-A-02 Register (alternate 5a): duplicate username -> 400', async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrf(agent);

    const username = uniqueUsername('dup');
    const password = 'P@ssw0rd123';

    await register(agent, { username, password, csrfToken }).expect(200);
    await register(agent, { username, password, csrfToken }).expect(400);
  });

  test('TP-UC2-N-01 Login (normal): returns JWT token', async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrf(agent);

    const username = uniqueUsername('login');
    const password = 'P@ssw0rd123';

    await register(agent, { username, password, csrfToken }).expect(200);

    const res = await login(agent, { username, password, csrfToken }).expect(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.split('.').length).toBe(3); // JWT format
  });

  test('TP-UC2-A-01 Login (alternate 3a): invalid credentials -> 401', async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrf(agent);

    const res = await login(agent, { username: 'nope', password: 'wrong', csrfToken }).expect(401);
    expect(res.body).toHaveProperty('error');
  });

  test('TP-UC3-A-01 View users without token -> 401', async () => {
    await request(app).get('/users').expect(401);
  });

  test('TP-UC3-E-02 View users with invalid token -> 403', async () => {
    await request(app)
      .get('/users')
      .set('Authorization', 'Bearer invalid.token.here')
      .expect(403);
  });

  test('TP-UC3-N-01 View users (normal): returns id + username only', async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrf(agent);

    const username = uniqueUsername('u');
    const password = 'P@ssw0rd123';

    await register(agent, { username, password, csrfToken }).expect(200);
    const loginRes = await login(agent, { username, password, csrfToken }).expect(200);
    const token = loginRes.body.token;

    const res = await agent
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    for (const row of res.body) {
      expect(row).toHaveProperty('id');
      expect(row).toHaveProperty('username');
      expect(row).not.toHaveProperty('password');
    }
  });

  test('TP-UC4-N-01 View posts (normal): output encodes content/title', async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrf(agent);

    const username = uniqueUsername('posts');
    const password = 'P@ssw0rd123';

    await register(agent, { username, password, csrfToken }).expect(200);
    const loginRes = await login(agent, { username, password, csrfToken }).expect(200);
    const token = loginRes.body.token;

    // Create a post containing script tag
    const xssTitle = '<script>alert(1)</script>';
    const xssContent = '<img src=x onerror=alert(1)>';

    await agent
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .set('X-CSRF-Token', csrfToken)
      .send({ title: xssTitle, content: xssContent })
      .expect(200);

    const res = await agent
      .get('/posts')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const created = res.body.find(p => typeof p.title === 'string' && p.title.includes('&lt;script&gt;'));
    expect(created).toBeTruthy();
    expect(created.title).not.toContain('<script>');
    expect(created.content).not.toContain('<img');
  });

  test('TP-UC5-A-01 Create post with missing CSRF -> 403', async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrf(agent);

    const username = uniqueUsername('csrf');
    const password = 'P@ssw0rd123';

    await register(agent, { username, password, csrfToken }).expect(200);
    const loginRes = await login(agent, { username, password, csrfToken }).expect(200);
    const token = loginRes.body.token;

    await agent
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      // missing X-CSRF-Token header
      .send({ title: 't', content: 'c' })
      .expect(403);
  });

  test('TP-UC5-A-02 Create post with missing fields -> 400', async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrf(agent);

    const username = uniqueUsername('missing');
    const password = 'P@ssw0rd123';

    await register(agent, { username, password, csrfToken }).expect(200);
    const loginRes = await login(agent, { username, password, csrfToken }).expect(200);
    const token = loginRes.body.token;

    await agent
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .set('X-CSRF-Token', csrfToken)
      .send({ title: '', content: '' })
      .expect(400);
  });

  test('TP-UC6-A-01 Manage posts: other user cannot edit/delete (404 safe)', async () => {
    const agentA = request.agent(app);
    const agentB = request.agent(app);

    const csrfA = await getCsrf(agentA);
    const csrfB = await getCsrf(agentB);

    const usernameA = uniqueUsername('A');
    const usernameB = uniqueUsername('B');
    const password = 'P@ssw0rd123';

    await register(agentA, { username: usernameA, password, csrfToken: csrfA }).expect(200);
    await register(agentB, { username: usernameB, password, csrfToken: csrfB }).expect(200);

    const tokenA = (await login(agentA, { username: usernameA, password, csrfToken: csrfA }).expect(200)).body.token;
    const tokenB = (await login(agentB, { username: usernameB, password, csrfToken: csrfB }).expect(200)).body.token;

    const created = await agentA
      .post('/posts')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('X-CSRF-Token', csrfA)
      .send({ title: 'owned', content: 'by A' })
      .expect(200);

    const postId = created.body.id;

    // User B tries to edit A's post
    await agentB
      .put(`/posts/${postId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .set('X-CSRF-Token', csrfB)
      .send({ title: 'hacked', content: 'nope' })
      .expect(404);

    // User B tries to delete A's post
    await agentB
      .delete(`/posts/${postId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .set('X-CSRF-Token', csrfB)
      .expect(404);
  });

  test('TP-UC6-E-02 Manage posts: post does not exist -> 404', async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrf(agent);

    const username = uniqueUsername('noexist');
    const password = 'P@ssw0rd123';

    await register(agent, { username, password, csrfToken }).expect(200);
    const token = (await login(agent, { username, password, csrfToken }).expect(200)).body.token;

    await agent
      .put('/posts/999999')
      .set('Authorization', `Bearer ${token}`)
      .set('X-CSRF-Token', csrfToken)
      .send({ title: 't', content: 'c' })
      .expect(404);

    await agent
      .delete('/posts/999999')
      .set('Authorization', `Bearer ${token}`)
      .set('X-CSRF-Token', csrfToken)
      .expect(404);
  });

  test('TP-UC7-N-01 Logout (normal): valid CSRF -> 200', async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrf(agent);

    const res = await agent
      .post('/logout')
      .set('X-CSRF-Token', csrfToken)
      .expect(200);

    expect(res.body).toHaveProperty('message');
  });

  test('TP-UC7-A-01 Logout (alternate 3a): invalid CSRF -> 403', async () => {
    const agent = request.agent(app);
    await getCsrf(agent);

    await agent
      .post('/logout')
      .set('X-CSRF-Token', 'invalid')
      .expect(403);
  });
});
