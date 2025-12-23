
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

**OWASP Top 10 mapping (reference):**
- OWASP Top 10 (2017):
	- **A1: Injection** (includes SQL Injection)
	- **A7: Cross-Site Scripting (XSS)**
	- **A3: Sensitive Data Exposure**
- OWASP Top 10 (2021) (updated categories):
	- **A03: Injection** (includes SQL Injection and XSS)
	- **A02: Cryptographic Failures** (covers many “sensitive data exposure” cases)
	- **A07: Identification and Authentication Failures** (relevant to weak session/auth patterns)

The insecure branch intentionally contains these issues so they can be demonstrated, tested, and compared against the secure implementation.

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
**What it is:** SQL Injection happens when untrusted input is concatenated into a SQL statement so the attacker can change the query’s meaning.

**Why it is dangerous (impact):**
- **Data loss**: attackers can delete tables/records.
- **Data theft**: attackers can read sensitive data from tables.
- **Authorization bypass**: attackers can modify WHERE clauses.
- **Compromise escalation**: depending on DB and configuration, injection can lead to broader system impact.

**How a hacker could exploit it (in this application):**
- The insecure backend builds SQL strings using request values (e.g., `title`, `content`, and also `:id` in edit/delete routes).
- A simple exploitation shown in this project is injecting into the `:id` path parameter on the delete route:

Example exploit request (demonstration payload):
```http
DELETE /posts/1 OR 1=1 HTTP/1.1
Host: localhost:4000
```
**Why this works:** the insecure backend constructs a statement like:
```sql
DELETE FROM posts WHERE id = 1 OR 1=1
```
which evaluates true for every row, deleting all posts.

**Where it was implemented (screenshots):**
- Backend SQL injection examples are in the insecure endpoints in backend route handlers.

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
**What it is:** XSS occurs when an application renders attacker-controlled content in the browser as executable code (JavaScript/HTML).

**Why it is dangerous (impact):**
- **Session theft / account takeover** (steal tokens/cookies if accessible)
- **Credential phishing** (fake login UI)
- **Malicious actions as the user** (CSRF-like effects via JS)
- **Worm-like propagation** in user-generated content

**How a hacker could exploit it (in this application):**
- The insecure backend returns post content without encoding.
- The insecure frontend renders post content using an unsafe sink:

```js
<span dangerouslySetInnerHTML={{ __html: post.content }} />
```

Example XSS payload (store it as a blog post content):
```html
<img src=x onerror=alert('XSS')>
```
When the posts list page loads, the browser executes the payload (an alert pops).

**Where it was implemented (screenshots):**
- Frontend rendering sink is in the blog posts component.
- Backend returns raw content as JSON; the frontend converts it into HTML execution.

### Sensitive Data Exposure (Insecure Example)
```js
// Insecure: Passwords stored in plaintext (if not using bcrypt)
// Example (not recommended):
db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
```
**What it is:** “Sensitive Data Exposure” (OWASP 2017) / **Cryptographic Failures** (OWASP 2021) describes failures to protect sensitive information (e.g., passwords, tokens) at rest or in transit.

**Why it is dangerous (impact):**
- **Credential reuse attacks**: if attackers obtain plaintext passwords, they can try them on other sites.
- **Irreversible breach**: plaintext passwords cannot be “un-leaked”; resetting is the only option.
- **Compliance risk**: storing secrets improperly increases legal and reputational impact.

**How a hacker could exploit it (in this application):**
- The insecure branch stores user passwords as provided (plaintext) inside the SQLite database.
- If an attacker gets access to the database file (e.g., via misconfig, backup leak, local compromise), they can read all passwords directly.

**Additional insecure patterns in this project:**
- Hard-coded secrets (example: JWT secret string in source) are risky because they tend to be leaked via repo sharing.
- Lack of HTTPS (in development) means credentials/tokens could be intercepted on untrusted networks (production must use HTTPS).

**References:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

### Why these vulnerabilities are so dangerous (summary)
- They are **high-impact** (data theft, data loss, account takeover).
- They are often **easy to exploit** once discovered.
- They can be combined (e.g., XSS steals tokens; SQLi dumps user tables).

### Evidence required: screenshots checklist (what to capture)
You must include two kinds of screenshots: **code** and **vulnerabilities in action**.

**A) Code screenshots (VS Code)**
- SQL Injection: screenshot the insecure SQL string interpolation in the posts routes.
- XSS: screenshot the `dangerouslySetInnerHTML` usage in the frontend posts list.
- Sensitive Data Exposure: screenshot the plaintext password insert (and/or the insecure login comparison).

**B) “In action” screenshots (runtime evidence)**
- SQL Injection exploitation:
	1. Create 2+ posts.
	2. Send `DELETE /posts/1 OR 1=1` (Postman or `curl`).
	3. Refresh posts list: show that all posts disappeared.
	4. Screenshot the request (payload) and the resulting empty posts list.
- XSS exploitation:
	1. Create a post whose content is `<img src=x onerror=alert('XSS')>`.
	2. Load the posts page.
	3. Screenshot the browser alert (and optionally DevTools Console).
- Sensitive Data Exposure:
	1. Register a user.
	2. Open the SQLite DB (or show a query result) proving the password is stored as plaintext.
	3. Screenshot the DB row showing the plaintext password.

**Optional but strong evidence (automated proof):**
- Run `npm run test` in the backend on the insecure branch and screenshot the passing test output for `api.insecure.test.js` (it includes an automated SQLi demonstration and plaintext password assertion).

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
**Explanation (how it secures SQLi):**
- The key security change is using **parameterized queries** (SQLite placeholders `?`) instead of string concatenation.
- Parameterization ensures attacker input is treated as *data* rather than executable SQL.
- The route also requires authentication (`authenticateToken`) and ties operations to the authenticated user, which reduces unauthorized manipulation.

**OWASP Cheat Sheet references:**
- OWASP Cheat Sheet Series — **SQL Injection Prevention** (use parameterized queries/prepared statements).
- OWASP Cheat Sheet Series — **Input Validation** (validate required fields, length, and format).

### XSS Mitigation (Secure Example)
**How XSS was addressed in this project:**
- **Primary control: output encoding.** The secure backend encodes post fields (e.g., `<`, `>`, `&`, quotes) before returning them so that user content is rendered as text instead of executable HTML/JS.
- **Safer rendering guidance:** avoid `dangerouslySetInnerHTML` for user content where possible; normal React rendering escapes by default.
- If HTML rendering is required, sanitize with a proven library (e.g., DOMPurify) and combine with a strict **Content Security Policy (CSP)**.

**OWASP Cheat Sheet references:**
- OWASP Cheat Sheet Series — **Cross Site Scripting (XSS) Prevention** (encode output; avoid unsafe sinks; sanitize only when required).
- OWASP Cheat Sheet Series — **DOM based XSS Prevention** (avoid unsafe DOM sinks like `innerHTML` / `dangerouslySetInnerHTML`).
- OWASP Cheat Sheet Series — **Content Security Policy** (use CSP as a defense-in-depth control).

### Sensitive Data Protection (Secure Example)
```js
// Secure: Passwords hashed with bcrypt
const hashedPassword = bcrypt.hashSync(password, 10);
db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
```
**Explanation (how Sensitive Data Exposure was mitigated):**
- **Passwords are never stored in plaintext.** The secure implementation hashes passwords using `bcrypt` so that a database leak does not expose usable passwords.
- **Secrets moved to configuration.** The secure backend reads the JWT signing secret from `process.env.JWT_SECRET` so it does not need to be hard-coded in source.
- **Tokens are time-limited.** JWTs include an expiry (`expiresIn`) to reduce the impact of token theft.
- **Data minimization in responses.** For example, user listing returns only `id` and `username` (no password hashes).
- **Transport protection (deployment requirement).** When deployed, HTTPS/TLS must be enforced so credentials and tokens are not exposed in transit.

**OWASP Cheat Sheet references:**
- OWASP Cheat Sheet Series — **Password Storage** (use adaptive hashing like bcrypt/Argon2; never store plaintext).
- OWASP Cheat Sheet Series — **JWT** / **Session Management** (protect secrets, validate tokens, set expirations).
- OWASP Cheat Sheet Series — **Transport Layer Security** (use HTTPS in production).

### Logging and Monitoring
Proper logging and monitoring helps detect attacks, investigate incidents, and prove security controls are working.

**What was implemented:**
- **Request logging** using `morgan('combined')` (method, path, status, response size, user agent). This supports identifying suspicious patterns (e.g., repeated 401/403 responses or unusual request rates).
- **Security-relevant event logging** (recommended events to capture):
	- login success/failure
	- access denied (401/403)
	- create/edit/delete actions
	- CSRF validation failures (403)

**Secure logging practices:**
- Do not log secrets (passwords, JWTs, CSRF tokens).
- Limit PII in logs; use retention/rotation; restrict access to logs.
- In real deployments, forward logs to a centralized platform (SIEM/Log Analytics) and set alerts.

**OWASP reference:**
- OWASP Cheat Sheet Series — **Logging** (log security events; include context; protect logs; avoid sensitive data).

### Security Headers Added (and why they improved security)
The secure backend enables `helmet()` to set baseline security headers that reduce browser-side attack surface.

**Examples of protections provided by security headers:**
- Prevent **MIME sniffing** (reduces content-type confusion attacks).
- Reduce **clickjacking** risk (prevent the site being framed by attackers).
- Reduce **information leakage** (referrer and fingerprinting reductions).
- Improve **cross-origin isolation/policies** to reduce cross-site data leak vectors.

**CSP note (ties to DAST results):**
- Baseline ZAP flagged CSP issues/missing CSP on parts of the application. A recommended next step is to configure an explicit CSP via Helmet (and ensure the frontend is served with it) to further reduce XSS impact.

**OWASP reference:**
- OWASP Cheat Sheet Series — **HTTP Headers** (recommended header set and rationale).
- OWASP Cheat Sheet Series — **Content Security Policy** (how to design a CSP).

**References:**
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)


## 13. Ethics Question

### Scenario Summary
During alpha testing / code review I discover a **major security vulnerability** that could seriously impact the **confidentiality, integrity, and availability** of sensitive organisational data. The discovery was influenced by knowledge gained during a penetration test for another client, but that engagement is protected by a **non‑disclosure clause (NDA)**. I inform the lead developer, who refuses to act due to time pressure.

This creates an ethical conflict between:
- protecting the public/users/organisation from harm, and
- respecting contractual confidentiality (NDA), and
- pressure from a senior colleague / organisational politics.

The approach below uses three principles from the **ACM/IEEE Software Engineering Code of Ethics and Professional Practice** and explains what actions I would take.

### Principle 1 — PUBLIC (Act in the public interest)
**Ethical requirement:** Software engineers should prioritise avoiding harm to the public and to those affected by the software.

**What I would do:**
- Treat the vulnerability as a **release‑blocking risk** and make it clear (in writing) that shipping without mitigation exposes users and the organisation to significant harm.
- Provide a short **risk statement**: likely impact, exploitability, affected data, and worst‑case outcomes (CIA).
- Propose at least one **time‑bounded mitigation** if a full fix cannot be completed (e.g., disable the vulnerable feature/endpoint, reduce exposure, add compensating controls, or delay release). “No action” is not ethically acceptable if foreseeable serious harm exists.

### Principle 2 — CLIENT AND EMPLOYER (Be honest; protect confidentiality; avoid conflicts)
**Ethical requirement:** Engineers owe duties to their client/employer, including honesty about risks, while also respecting confidentiality and contractual obligations.

**What I would do (NDA‑safe handling):**
- Do **not** disclose confidential details from the other client’s engagement (e.g., their systems, payloads, or proprietary techniques).
- Re‑validate the vulnerability **independently** within the current project context (using our own testing evidence) so the report stands on its own.
- Communicate the finding through **approved internal channels** (ticketing system/security mailbox) with appropriate access restrictions.
- If there is uncertainty about NDA scope, request guidance from the organisation’s **legal/compliance** function (or the contracting entity) before sharing anything that could violate the NDA.

### Principle 3 — PRODUCT / PROFESSIONAL JUDGMENT (Ensure the product meets appropriate standards; maintain integrity)
**Ethical requirement:** Engineers should ensure software meets professional standards, including security, and should not let schedule pressure override necessary quality and safety.

**What I would do if the lead developer refuses:**
- Escalate to the **project manager / security lead / engineering manager** (not as “blame,” but as risk management). Provide a concise technical write‑up and suggested mitigations.
- Request a formal **risk acceptance** decision (signed off by an accountable manager) if they still insist on shipping. This ensures the decision is visible and owned at the right level.
- If the organisation still refuses to mitigate a severe issue, I would consider **withdrawing from sign‑off/approval** and documenting my objection via the professional process.

### Responsible disclosure and last‑resort actions
If the risk is severe and imminent and internal escalation fails, responsible disclosure principles may apply; however, any external disclosure must be handled carefully to avoid violating the NDA and applicable laws. In practice I would:
- continue escalating internally,
- involve legal/compliance,
- follow the organisation’s vulnerability disclosure/incident policies.

### Conclusion
I would act to prevent foreseeable harm by **escalating appropriately**, insisting on **fix or mitigation**, and ensuring the decision is made by the correct accountable roles, while strictly respecting the **NDA** by avoiding disclosure of the other client’s confidential information and re‑producing evidence within the current project.

**Reference:** ACM/IEEE Software Engineering Code of Ethics and Professional Practice.

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
