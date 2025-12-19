# Secure Application Programming Project Documentation

## 1. Software Development Lifecycle (SDLC) Comparison and Justification

### Models Compared: Agile vs. Iterative

**Agile Model:**
- Focuses on flexibility, collaboration, and iterative development.
- Frequent feedback and adaptation to change.
- Supports continuous integration, testing, and secure coding practices.
- Ideal for projects with evolving requirements and security needs.

**Iterative Model:**
- Develops the application in repeated cycles (iterations).
- Each cycle adds features and refines the product.
- Good for gradually introducing and fixing vulnerabilities.
- Allows for incremental improvement and testing.

**Justification:**
Agile is chosen for this project because it enables rapid response to feedback, supports secure coding practices, and allows for continuous testing and improvement. This aligns with the project’s requirements for secure/insecure code comparison, thorough testing, and ethical review.

## 2. Software Requirements Specification (SRS)

### 2.1 Introduction
- Purpose: Define requirements for a secure web application demonstrating both vulnerable and secure coding practices.
- Scope: Full-stack web app with separate backend (Java/Spring Boot) and frontend (React). Database: SQLite3 or MySQL.

### 2.2 Functional Requirements
- User authentication (login/register)
- Data input and display (forms, tables)
- Demonstration of vulnerabilities (SQL Injection, XSS, Sensitive Data Exposure)
- Secure versions of all features
- Logging and monitoring

### 2.3 Non-Functional Requirements
- Usability: Intuitive UI, clear error messages
- Performance: Responsive interface, efficient queries
- Security: OWASP Top 10 compliance, secure coding standards
- Reliability: Error handling, data validation

### 2.4 Technology Stack
- Backend: Java (Spring Boot)
- Frontend: React
- Database: SQLite3 or MySQL
- Version Control: GitHub

## 3. Version Control Strategy
- Use GitHub with branches: `main` (default), `secure`, `insecure`
- .gitignore for sensitive/config files
- Issues and project board for planning
- README.md with setup instructions

## 4. Vulnerabilities Introduced (Insecure Branch)
- SQL Injection
- XSS (Reflected, DOM-based, Stored)
- Sensitive Data Exposure
- Screenshots and code samples to be added

## 5. Vulnerability Mitigation (Secure Branch)
- Use OWASP cheat sheets for fixes
- Add logging and monitoring
- Screenshots and code samples to be added
- Importance of logging/monitoring explained

## 6. Testing
- Functional and security tests (Selenium, ZAP)
- Testing plan based on use cases
- Document results and provide screenshots

## 7. Video Presentation
- Short demo video covering all requirements

## 8. Ethics Scenario
- Discuss three Software Engineering Code of Ethics principles
- Describe actions taken regarding discovered vulnerability

---

*References to be added in formal academic style as required.*

*Use this document to compile all required sections for your final submission.*
