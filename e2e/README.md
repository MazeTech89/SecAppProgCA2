# E2E Tests (Playwright)

This folder contains Playwright end-to-end tests that implement the Normal/Alternate flows from Section 7 use-cases.

## Run

From the repository root:

1. Install deps:
   - `cd e2e`
   - `npm install`
   - `npx playwright install`

2. Run tests (headless):
   - `npm test`

Notes:
- The Playwright config starts both servers:
  - Backend: `http://localhost:4000`
  - Frontend: `http://localhost:3000`
- It uses a dedicated DB file: `e2e/.tmp/e2e.db`
