// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  // Run tests from e2e/tests against the React dev server.
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: 0,
  use: {
    // baseURL lets tests use relative paths like page.goto('/login').
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry'
  },
  webServer: [
    {
      // Start the backend first (frontend depends on it).
      // Uses in-memory DB so runs are isolated.
      command: 'npx cross-env PORT=4000 DB_PATH=":memory:" JWT_SECRET=e2e_secret npm --prefix ../backend start',
      url: 'http://localhost:4000/csrf-token',
      reuseExistingServer: true,
      timeout: 120_000
    },
    {
      // Start the CRA dev server for the frontend.
      command: 'npx cross-env BROWSER=none PORT=3000 npm --prefix ../frontend start',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 180_000
    }
  ]
});
