
# Secure Application Programming Project Documentation

## Table of Contents
1. Software Development Lifecycle Methodology
2. Introduction
3. Software Requirement Specification
	- General Description
	- Requirements
	- Functional Requirements
	- Non-Functional Requirements
	- Data Classification
4. Entity Relation Diagram (ERD)
5. Technical Specification
	- High-Level Architectural Diagram
	- Wireframes
6. Use-Case Diagram
7. Use-Case Description
8. Class Diagram
9. Sequence Diagram
10. Testing Plan
11. Discussion on the Insecure Code
12. Discussion on the Secure Code
13. Ethics Question
14. Appendix A: Breakdown of Marks
15. Appendix B

---

## 1. Software Development Lifecycle Methodology
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

## 2. Introduction
In this project, an open-source web application is developed using Node.js with Express for the backend and React for the frontend. The database is SQLite3. The application demonstrates both vulnerable (insecure) and secure coding practices, focusing on SQL Injection, XSS, and Sensitive Data Exposure. Two implementations are provided: an insecure version (with vulnerabilities) and a secure version (with mitigations and security features).

## 3. Software Requirement Specification

### General Description
This project is a simple blog platform web application. Users can register, log in, and create, edit, or delete their own blog posts. The application is designed to demonstrate both insecure and secure coding practices, specifically focusing on SQL Injection, Cross-Site Scripting (XSS), and Sensitive Data Exposure vulnerabilities. There are two main versions: an insecure version (with vulnerabilities intentionally left in) and a secure version (with mitigations and best practices applied).


### Requirements
**Product Scope:**
- The application allows users to create an account, log in, and manage their own blog posts.
- Users can create, view, edit, and delete blog posts.
- The insecure version demonstrates vulnerabilities (SQL Injection, XSS, Sensitive Data Exposure).
- The secure version mitigates these vulnerabilities and adds security features (CSRF protection, session management, security headers, logging, and monitoring).
- The application does not include advanced features such as comments, media uploads, or user roles beyond basic authentication.
- The UI is kept simple to focus on secure programming concepts rather than design or UX.

### Functional Requirements
- User authentication (login/register)
- Create, edit, and delete blog posts
- Demonstrate vulnerabilities (SQL Injection, XSS, Sensitive Data Exposure)
- Secure versions of all features
- Logging and monitoring

### Non-Functional Requirements
- Usability: Intuitive UI, clear error messages
- Performance: Responsive interface, efficient queries
- Security: OWASP Top 10 compliance, secure coding standards
- Reliability: Error handling, data validation


### Data Classification
| Type of Data                  | Basis for Collection                | Security Features (Secure Version)           |
|------------------------------|-------------------------------------|----------------------------------------------|
| Username, Password           | User authentication and access      | Passwords hashed (bcrypt), HTTPS, input validation |
| Blog Post Content, Title     | User-generated content              | Input validation, output encoding, XSS protection |
| Session Token (JWT)          | Session management                  | Secure token storage, HTTP-only cookies, CSRF protection |
| Logs (login, actions, errors)| Monitoring and auditing             | Access controls, log sanitization, monitoring |

Sensitive data (e.g., passwords) is never stored in plaintext. The application is designed to comply with data protection principles such as the GDPR, ensuring users can request deletion of their data. Only minimal personal data is collected, and all sensitive operations are protected in the secure version.

## 4. Entity Relation Diagram (ERD)
*Insert ERD diagram and explanation here.*

## 5. Technical Specification
### High-Level Architectural Diagram
*Insert architectural diagram and description here.*

### Wireframes
*Insert wireframes for each page here.*

## 6. Use-Case Diagram
*Insert use-case diagram here.*

## 7. Use-Case Description
*Provide use-case descriptions using the template provided in your brief.*

## 8. Class Diagram
*Insert class diagram and explain design patterns used (e.g., Singleton, Observer, DRY, SOLID).* 

## 9. Sequence Diagram
*Insert sequence diagram and describe the sequence of messages.*

## 10. Testing Plan
*Describe the testing plan, tools used (Selenium, ZAP), and results.*


## 11. Insecure Code: Vulnerabilities and Examples

This section presents the **insecure implementation** first, with code snippets and explanations for each vulnerability. Only one version (insecure or secure) should be active in the codebase at a time.

### SQL Injection (Insecure Example)
```js
// Vulnerable: direct string interpolation, no user_id
app.post('/posts', (req, res) => {
	const { title, content } = req.body;
	if (!title || !content) return res.status(400).json({ error: 'Missing fields' });
	const sql = `INSERT INTO posts (title, content) VALUES ('${title}', '${content}')`;
	db.run(sql, function(err) {
		if (err) return res.status(400).json({ error: err.message });
		res.json({ id: this.lastID, title, content });
	});
});
```
**Explanation:** This endpoint is vulnerable to SQL Injection because user input is directly interpolated into the SQL query string without sanitization or parameterization.

### Cross-Site Scripting (XSS) (Insecure Example)
```js
// Insecure: Get all posts (no output encoding, XSS possible, no auth)
app.get('/posts', (req, res) => {
	db.all('SELECT * FROM posts', [], (err, rows) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json(rows);
	});
});
```
**Explanation:** No output encoding or sanitization is performed, so malicious scripts in post content can be executed in the browser.

### Sensitive Data Exposure (Insecure Example)
```js
// Insecure: Passwords stored in plaintext (if not using bcrypt)
// Example (not recommended):
db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
```
**Explanation:** Storing passwords in plaintext exposes users to credential theft if the database is compromised.

**References:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## 12. Secure Code: Mitigations and Best Practices

This section presents the **secure implementation** after the insecure code, with code snippets and explanations for each mitigation. Only one version (insecure or secure) should be active in the codebase at a time.

### SQL Injection Mitigation (Secure Example)
```js
// Secure: Use parameterized queries and authentication
app.post('/posts', authenticateToken, (req, res) => {
	const { title, content } = req.body;
	const userId = req.user.id;
	if (!title || !content) return res.status(400).json({ error: 'Missing fields' });
	db.run('INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)', [title, content, userId], function(err) {
		if (err) return res.status(400).json({ error: err.message });
		res.json({ id: this.lastID, title, content });
	});
});
```
**Explanation:** This endpoint uses parameterized queries to prevent SQL Injection and requires authentication.

### XSS Mitigation (Secure Example)
```js
// Secure: Output encoding and input validation (frontend and backend)
// Example: Use libraries like DOMPurify on the frontend, and validate/sanitize input on the backend.
```
**Explanation:** Output encoding and input validation prevent malicious scripts from being executed.

### Sensitive Data Protection (Secure Example)
```js
// Secure: Passwords hashed with bcrypt
const hashedPassword = bcrypt.hashSync(password, 10);
db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
```
**Explanation:** Passwords are hashed before storage, protecting user credentials.

**Additional Mitigations:**
- Security headers (Helmet)
- CSRF protection
- Session management (JWT, HTTP-only cookies)
- Logging and monitoring

**References:**
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)


## 13. Ethics Question
*Discuss three Software Engineering Code of Ethics principles and actions taken regarding discovered vulnerabilities.*

## 14. Appendix A: Breakdown of Marks
| Section | Description | % mark |
|---------|-------------|--------|
| 1 | Software Development Lifecycle justification | 10% |
| 2 | Software Requirement Specification | 20% |
| 3 | The Use of GitHub for code and project planning | 5% |
| 4 | Discussion of Insecure code implementation | 20% |
| 5 | Discussion of Secure code implementation | 20% |
| 6 | Testing Documentation and results | 10% |
| 7 | Short video demonstrating your project | 5% |
| 8 | Ethics | 10% |

## 15. Appendix B
- Link to GitHub:
- Link to Video Demonstration:

---

*References to be added in formal academic style as required.*

*Use this document to compile all required sections for your final submission.*
