// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry'
  },
  webServer: [
    {
      // Backend must start before frontend because CRA proxy points to :4000
      command: 'npx cross-env PORT=4000 DB_PATH=":memory:" JWT_SECRET=e2e_secret npm --prefix ../backend start',
      url: 'http://localhost:4000/csrf-token',
      reuseExistingServer: true,
      timeout: 120_000
    },
    {
      command: 'npx cross-env BROWSER=none PORT=3000 npm --prefix ../frontend start',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 180_000
    }
  ]
});
