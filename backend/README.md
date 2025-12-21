# Secure/Insecure Blog Platform Backend

This backend demonstrates both insecure and secure coding practices for educational purposes. Only one version (insecure or secure) should be active at a time. See comments in `index.js` for switching.

## Prerequisites
- Node.js (v14 or higher recommended)
- npm (Node package manager)

## Setup
1. Open a terminal in the `backend` directory.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the backend server:
   ```sh
   npm start
   ```
   The server runs on port 4000 by default.

## Switching Between Insecure and Secure Code
- By default, the **insecure endpoints** are active in `index.js`.
- To activate the secure endpoints:
  1. Comment out the insecure endpoints block.
  2. Uncomment the secure endpoints block (see comments in `index.js`).
- Only one version should be active at a time.

## API Endpoints (Insecure Example)
- `POST /register` — Register a new user (insecure: stores plaintext password)
- `POST /login` — Login (insecure: no JWT, no hashing)
- `POST /posts` — Create a post (vulnerable to SQL Injection)
- `GET /posts` — Get all posts (vulnerable to XSS)
- `PUT /posts/:id` — Edit a post (vulnerable to SQL Injection)
- `DELETE /posts/:id` — Delete a post (vulnerable to SQL Injection)

## API Endpoints (Secure Example)
- `POST /register` — Register a new user (secure: hashes password)
- `POST /login` — Login (secure: returns JWT)
- `POST /posts` — Create a post (parameterized, requires auth)
- `GET /posts` — Get all posts (requires auth)
- `PUT /posts/:id` — Edit a post (parameterized, requires auth)
- `DELETE /posts/:id` — Delete a post (parameterized, requires auth)

## Database
- Uses SQLite3 (`database.db` file created automatically).
- Tables: `users`, `posts`.

## Notes
- For demonstration only. Do **not** use insecure code in production.
- See project documentation for details on vulnerabilities and mitigations.
