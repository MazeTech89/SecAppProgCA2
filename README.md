# Secure Application Programming Project

This repository contains a full-stack web application demonstrating both vulnerable and secure coding practices for educational purposes.

## Branch Strategy
- **main**: Stable, production-ready code
- **secure**: Secure implementations (OWASP Top 10 compliance)
- **insecure**: Deliberately vulnerable code (for demonstration)

## Project Structure
- `backend/`: Java Spring Boot API
- `frontend/`: React app

## Setup Instructions

### Backend
1. Navigate to `backend/`
2. Follow instructions in `backend/README.md`

### Frontend
1. Navigate to `frontend/`
2. Follow instructions in `frontend/README.md`

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
