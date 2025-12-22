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

## Technical Overview

This project is a full-stack web application built with a React frontend, an Express.js backend, and a SQLite3 database. The backend exposes both secure and intentionally insecure RESTful API endpoints to demonstrate common web vulnerabilities (such as SQL Injection, XSS, and Sensitive Data Exposure) and their mitigations. Security features in the secure implementation include:

- JWT-based authentication (stateless, token in localStorage)
- CSRF protection (using csurf middleware)
- Security headers (Helmet)
- Request logging (Morgan)
- Input validation and output encoding
- Password hashing (bcrypt)
- CORS with credentials for frontend-backend communication
- Secure /users endpoint (returns only id and username, requires authentication)

The application is designed for educational purposes, focusing on secure coding practices, vulnerability demonstration, and clear documentation rather than UI/UX design. The codebase is maintained in two branches: `secure` (active, with all secure features enabled) and `insecure` (with vulnerabilities for demonstration). Only one branch should be active at a time for assessment.
### Secure Endpoints Summary

- `/register` (POST): Register a new user (CSRF protected, password hashed)
- `/login` (POST): Authenticate user, returns JWT token (CSRF protected)
- `/logout` (POST): Instructs client to remove JWT (CSRF protected)
- `/users` (GET): Returns all users (id, username only, requires authentication)
- `/posts` (GET, POST, PUT, DELETE): CRUD for blog posts (requires authentication, CSRF protected for write operations)

All secure endpoints require proper authentication and CSRF tokens where appropriate. Insecure endpoints are commented out in the secure branch.

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

High-Level Architectural Diagram

+-------------------+         HTTP(S)         +-------------------+         SQL         +-------------------+
|    React Frontend | <--------------------> |  Express.js API   | <----------------> |   SQLite3 DB      |
|  (JavaScript, JSX)|   RESTful API calls    | (Node.js, Helmet, |   SQL Queries     | (File-based DB)   |
|                   |                       |  Morgan, csurf,   |                  |                   |
| - User Interface  |                       |  JWT, bcrypt)     |                  |                   |
+-------------------+                       +-------------------+                  +-------------------+






**Description:**
- **React Frontend** (http://localhost:3000):
	- Provides the user interface for registration, login, and blog post management.
	- Communicates with the backend exclusively via RESTful API calls using the Fetch API.
	- Handles CSRF tokens and authentication tokens (JWT) as provided by the backend.

- **Express.js Backend** (Node.js, http://localhost:4000):
	- Exposes both secure and intentionally insecure REST API endpoints for demonstration and assessment.
	- Secure endpoints implement:
		- JWT-based authentication (stateless, HTTP-only cookies)
		- CSRF protection (using csurf middleware)
		- Security headers (Helmet)
		- Request logging (Morgan)
		- Input validation and output encoding
		- Password hashing (bcrypt)
		- CORS with credentials for frontend-backend communication
	- Insecure endpoints deliberately omit these protections to demonstrate vulnerabilities (e.g., SQL Injection, XSS, plaintext passwords).
	- Only the backend accesses the database directly; the frontend never interacts with the database.

- **SQLite3 Database**:
	- Stores user credentials (with hashed passwords in the secure version) and blog post data.
	- Is file-based and only accessible by the backend server.
	- No direct access from the frontend or external clients.

- **Security Boundaries & Data Flow:**
	- All sensitive operations (authentication, data storage, business logic) are handled by the backend.
	- The frontend never receives or stores plaintext passwords or sensitive data.
	- Security features (authentication, CSRF, headers, logging) are enforced only on secure endpoints; insecure endpoints are available for educational testing and demonstration.
	- The application is designed to clearly separate secure and insecure code for assessment and learning purposes.

### Wireframes

![All Wireframes](docs/wireframes/all-wireframes.svg)

Login Page

![Login Wireframe](docs/wireframes/login-wireframe.svg)


-----------------------------
|        Login              |
|---------------------------|
| Username: [___________]   |
| Password: [___________]   |
| [ Login ]   [ Register ]  |
|---------------------------|
| [Error/Success Message]   |
-----------------------------


Register Page


-----------------------------
|      Register             |
|---------------------------|
| Username: [___________]   |
| Password: [___________]   |
| [ Register ]   [ Login ]  |
|---------------------------|
| [Error/Success Message]   |
-----------------------------


User List & Blog Posts Page (after login)


---------------------------------------------------
|  [Logout]   [User List]   [Blog Posts]           |
|-------------------------------------------------|
| User List:                                      |
|  - user1                                        |
|  - user2                                        |
|-------------------------------------------------|
| Blog Posts:                                     |
|  [Title] by User [id]: [Content]                |
|  [Edit] [Delete]                                |
|-------------------------------------------------|
| [Create/Edit Post Form]                         |
| Title:    [___________]                         |
| Content:  [___________]                         |
| [Create/Update Post]                            |
|-------------------------------------------------|
| [Error/Success Message]                         |
---------------------------------------------------


Navigation (all pages)


-----------------------------
| [Login] [Register]         |
| (if not authenticated)     |
| [User List] [Logout]       |
| (if authenticated)         |
-----------------------------


## 6. Use-Case Diagram

The use-case diagram below provides a high-level overview of the system from the perspective of the primary user. To keep the diagram concise, authentication is modeled as a reusable use-case that is always included by protected actions.

![Use-Case Diagram](docs/diagrams/use-case-diagram.svg)

```mermaid
usecaseDiagram
actor Visitor as V
actor "Authenticated User" as U

rectangle "Secure Blog Application" {
	(Register Account) as UC_Register
	(Authenticate User) as UC_Auth
	(View User List) as UC_ViewUsers
	(View Blog Posts) as UC_ViewPosts
	(Create Blog Post) as UC_CreatePost
	(Manage Own Blog Posts) as UC_ManagePosts
	(Log Out) as UC_Logout

	UC_ViewUsers ..> UC_Auth : <<include>>
	UC_ViewPosts ..> UC_Auth : <<include>>
	UC_CreatePost ..> UC_Auth : <<include>>
	UC_ManagePosts ..> UC_Auth : <<include>>
	UC_Logout ..> UC_Auth : <<include>>
}

V --> UC_Register
V --> UC_Auth

U --> UC_ViewUsers
U --> UC_ViewPosts
U --> UC_CreatePost
U --> UC_ManagePosts
U --> UC_Logout
```

## 7. Use-Case Description

The following use-case descriptions correspond **exactly** to the use-case names in the Use-Case Diagram (Section 6).

### Use-Case: Register Account

- **Short Description:** Visitor creates a new account by submitting a username and password.

- **Primary Actor:** Visitor
- **Goal:** Create a new account in the system.
- **Preconditions:** Visitor is not currently authenticated.
- **Trigger:** Visitor selects “Register”.
- **Main Success Scenario:**
	1. Visitor opens the Register page.
	2. Visitor enters a username and password.
	3. System validates required fields.
	4. System securely hashes the password.
	5. System creates the user record.
	6. System confirms registration success.
- **Extensions / Alternate Flows:**
	- 3a. Missing fields → System shows validation error.
	- 5a. Username already exists → System shows error and no account is created.
- **Postconditions (Success):** A new user account exists in the database.
- **Postconditions (Failure):** No new account is created.

### Use-Case: Authenticate User

- **Short Description:** Visitor logs in and receives a JWT token to access protected features.

- **Primary Actor:** Visitor
- **Goal:** Log in and obtain an authenticated session token.
- **Preconditions:** Visitor has a registered account.
- **Trigger:** Visitor selects “Login” and submits credentials.
- **Main Success Scenario:**
	1. Visitor opens the Login page.
	2. Visitor enters username and password.
	3. System validates credentials.
	4. System issues a JWT token.
	5. System returns token to the client.
	6. User is now treated as an Authenticated User.
- **Extensions / Alternate Flows:**
	- 3a. Invalid username/password → System returns “Invalid credentials”.
- **Postconditions (Success):** Client stores a valid JWT and can access protected endpoints.
- **Postconditions (Failure):** No token is issued; user remains unauthenticated.

### Use-Case: View User List

- **Short Description:** Authenticated User views a list of users (id and username only).

- **Primary Actor:** Authenticated User
- **Goal:** View a list of registered users (id and username only).
- **Preconditions:** User is authenticated.
- **Includes:** Authenticate User (always required).
- **Trigger:** User navigates to “User List”.
- **Main Success Scenario:**
	1. User selects “User List”.
	2. Client sends a request with JWT token.
	3. System validates token.
	4. System returns list of users (id, username).
	5. Client displays the user list.
- **Extensions / Alternate Flows:**
	- 3a. Missing/invalid token → System denies access (401/403) and client redirects to Login.
- **Postconditions (Success):** User list is displayed.

### Use-Case: View Blog Posts

- **Short Description:** Authenticated User retrieves and views blog posts from the system.

- **Primary Actor:** Authenticated User
- **Goal:** View blog posts.
- **Preconditions:** User is authenticated.
- **Includes:** Authenticate User (always required).
- **Trigger:** User navigates to “Blog Posts”.
- **Main Success Scenario:**
	1. User opens the posts page.
	2. Client sends a request with JWT token.
	3. System validates token.
	4. System retrieves posts from the database.
	5. System applies output encoding before returning content.
	6. Client displays the posts.
- **Extensions / Alternate Flows:**
	- 3a. Missing/invalid token → System denies access (401/403).
- **Postconditions (Success):** Blog posts are displayed to the user.

### Use-Case: Create Blog Post

- **Short Description:** Authenticated User creates a new blog post linked to their account.

- **Primary Actor:** Authenticated User
- **Goal:** Create a new blog post linked to the authenticated user.
- **Preconditions:** User is authenticated.
- **Includes:** Authenticate User (always required).
- **Trigger:** User submits the “Create Post” form.
- **Main Success Scenario:**
	1. User enters a title and content.
	2. Client requests a CSRF token (if not cached).
	3. Client submits the post request with JWT + CSRF token.
	4. System validates JWT and CSRF token.
	5. System validates required fields.
	6. System inserts the post using parameterized SQL.
	7. System confirms creation.
- **Extensions / Alternate Flows:**
	- 4a. Invalid CSRF token → System rejects request (403).
	- 5a. Missing fields → System rejects request (400).
- **Postconditions (Success):** A new post exists and is owned by the authenticated user.

### Use-Case: Manage Own Blog Posts

- **Short Description:** Authenticated User edits or deletes only their own blog posts.

- **Primary Actor:** Authenticated User
- **Goal:** Update or delete blog posts owned by the authenticated user.
- **Preconditions:** User is authenticated and owns at least one post.
- **Includes:** Authenticate User (always required).
- **Trigger:** User selects “Edit” or “Delete” on a post.
- **Main Success Scenario (Edit):**
	1. User selects “Edit” on one of their posts.
	2. User updates title/content and submits.
	3. Client submits request with JWT + CSRF token.
	4. System validates JWT and CSRF token.
	5. System updates the post using parameterized SQL and enforces ownership.
	6. System confirms update.
- **Main Success Scenario (Delete):**
	1. User selects “Delete” on one of their posts.
	2. Client submits request with JWT + CSRF token.
	3. System validates JWT and CSRF token.
	4. System deletes the post using parameterized SQL and enforces ownership.
	5. System confirms deletion.
- **Extensions / Alternate Flows:**
	- 5a. Post not owned by user → System does not modify/delete (access denied or no-op).
	- 4a. Invalid CSRF token → System rejects request (403).
- **Postconditions (Success):** Post is updated or removed as requested.

### Use-Case: Log Out

- **Short Description:** Authenticated User ends the session by removing the stored JWT and returning to the logged-out UI.

- **Primary Actor:** Authenticated User
- **Goal:** End the user’s authenticated session on the client.
- **Preconditions:** User is authenticated.
- **Includes:** Authenticate User (always required).
- **Trigger:** User selects “Logout”.
- **Main Success Scenario:**
	1. User selects “Logout”.
	2. Client requests a CSRF token (if not cached).
	3. Client calls the logout endpoint with CSRF token.
	4. Client removes the JWT from storage.
	5. System confirms logout response.
	6. Client updates UI to logged-out state and shows Login/Register.
- **Extensions / Alternate Flows:**
	- 3a. Invalid CSRF token → System rejects request (403). Client still removes token locally.
- **Postconditions (Success):** JWT is removed; user can no longer access protected resources.

## 8. Class Diagram
*Insert class diagram and explain design patterns used (e.g., Singleton, Observer, DRY, SOLID).* 

## 9. Sequence Diagram
*Insert sequence diagram and describe the sequence of messages.*

## 10. Testing Plan
*Describe the testing plan, tools used (Selenium, ZAP), and results.*

## 11. Discussion on the Insecure Code
- Explain and illustrate SQL Injection, XSS, and Sensitive Data Exposure vulnerabilities.
- Reference OWASP Top 10.
- Provide code and screenshots.

## 12. Discussion on the Secure Code
- Explain how vulnerabilities were mitigated (OWASP Cheat Sheets, security headers, CSRF, session management, logging, monitoring).
- Provide code and screenshots.

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
- Link to GitHub: [YOUR_GITHUB_REPO_URL_HERE] (branch: secure)
- Link to Video Demonstration:

---

*References to be added in formal academic style as required.*

*Use this document to compile all required sections for your final submission.*


