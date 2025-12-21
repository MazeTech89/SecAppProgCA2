# Secure/Insecure Blog Platform Frontend

This is the React frontend for the secure/insecure blog platform demo. It works with the backend to demonstrate both insecure and secure coding practices.

## Prerequisites
- Node.js (v14 or higher recommended)
- npm (Node package manager)

## Setup
1. Open a terminal in the `frontend` directory.
2. Install dependencies:
	```sh
	npm install
	```
3. Start the frontend app:
	```sh
	npm start
	```
	The app runs on port 3000 by default.

## Switching Between Insecure and Secure Modes
- The frontend is designed to work with either the insecure or secure backend.
- To test insecure features (no auth, XSS, etc.), ensure the insecure backend endpoints are active.
- To test secure features (JWT, input validation, etc.), ensure the secure backend endpoints are active.
- See comments in the backend and frontend code for switching logic if needed.

## Features
- Register and login forms
- Create, view, edit, and delete blog posts
- Demonstrates insecure (no auth, XSS, SQLi) and secure (JWT, parameterized queries, XSS protection) flows

## Notes
- For demonstration only. Do **not** use insecure code in production.
- See project documentation for details on vulnerabilities and mitigations.