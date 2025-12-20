
# Secure Application Programming Project

This repository contains a full-stack web application demonstrating both vulnerable and secure coding practices for educational purposes.

## Branch Strategy
- **main**: Stable, production-ready code
- **secure**: Secure implementations (OWASP Top 10 compliance)
- **insecure**: Deliberately vulnerable code (for demonstration)

## Project Structure
- `backend/`: Node.js/Express API (with SQLite3)
- `frontend/`: React app


## Setup & Running Instructions

### Backend
1. Open a terminal and navigate to `backend/`
2. Run `npm install` to install dependencies
3. Start the server with `npm start` (or `npm run dev` for development with nodemon)
4. The backend runs on [http://localhost:4000](http://localhost:4000) by default
5. If you see a ReferenceError or port conflict, ensure no other server is running and that the code is up to date.

### Frontend
1. Open a new terminal and navigate to `frontend/`
2. Run `npm install` to install dependencies
3. Start the frontend with `npm start`
4. The frontend runs on [http://localhost:3000](http://localhost:3000) by default
5. If you see errors about endpoints, ensure the backend is running and accessible at the correct port.

### Troubleshooting
- If you get a 400 or 500 error, check that you have registered a user and are using a valid user ID for blog posts.
- If you get a CORS or network error, make sure both servers are running and accessible.
- To stop a server, press Ctrl+C in the terminal where it is running.

## Security & Testing
- Demonstrates vulnerabilities: SQL Injection, XSS, Sensitive Data Exposure
- Secure versions provided in `secure` branch
- Functional and security tests recommended (Selenium, ZAP)

## Version Control
- Use `.gitignore` to protect sensitive/config files
- Use GitHub Issues and Project Board for planning

## Documentation
- See `SecureAppProjectDocumentation.md` for full project brief, requirements, and reporting

---

*For academic use only. Do not deploy vulnerable code to production environments.*
