# Home Tutor Finder

Full-stack tutor marketplace: **Next.js 15 / React 19 / TypeScript / Tailwind** frontend, **Java 21 / Spring Boot 3 / Spring Security (JWT) / JPA / Flyway** backend, **MySQL** database.

> Status: the code was written but **not compiled or run** in the environment that produced this zip. Follow the steps below and fix any small errors your tools report.

## Features
- Student & tutor registration/login, BCrypt passwords, JWT in a `Secure/HttpOnly/SameSite=Lax` cookie (never localStorage).
- Role-based access enforced by the backend (401 not signed in, 403 wrong role/owner).
- Tutor search with filters, sorting and pagination; tutor profiles; weekly availability.
- Tutoring requests: student sends → tutor accepts/rejects → student can cancel. All stored in MySQL.
- Razorpay checkout for accepted tutoring requests: the student pays the tutor's fee snapshot for one hour; the backend verifies Razorpay's signature and confirms the captured payment before showing it as paid.
- Swagger UI, Flyway migrations, backend integration tests, frontend schema tests.

## 1. Install software
- **JDK 21** (e.g. Temurin) → check: `java -version`
- **Maven 3.9+** → `mvn -version`
- **Node.js 20+** → `node -v`, `npm -v`
- **MySQL 8** → `mysql --version`

## 2. Create the database (any terminal)
```
mysql -u root -p
CREATE DATABASE home_tutor_finder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```
Tables are created automatically by Flyway (`backend/src/main/resources/db/migration`) when the backend starts. Hibernate only *validates* the schema.

## 3. Configure the backend (PowerShell, in `home-tutor-finder\backend`)
```
Copy-Item .env.example .env
notepad .env
```
Set `DB_PASSWORD` and a `JWT_SECRET` of **32+ characters**. `.env` is read automatically at startup and is git-ignored.
Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to your Razorpay **test** credentials to enable payment. Never put the key secret in frontend configuration or commit it.

## 4. Run the backend (PowerShell, in `home-tutor-finder\backend`)
```
mvn spring-boot:run
```
API: http://localhost:8080/api · Swagger UI: http://localhost:8080/swagger-ui.html

Run tests (uses in-memory H2, no MySQL needed): `mvn test`

## 5. Run the frontend (PowerShell, in `home-tutor-finder\frontend`)
```
Copy-Item .env.example .env.local
npm install
npm run dev
```
Open http://localhost:3001. Other commands: `npm run build`, `npm run typecheck`, `npm test`.

## 6. Try it
1. Go to **Sign Up**, create a *Tutor* account (pick subjects) → you land on `/tutor/dashboard`. Add availability.
2. Log out, create a *Student* account → `/student/dashboard`. Use **Find Tutors**, open a tutor, **Send Request**.
3. Sign in as the tutor → **Requests** → Accept/Reject. Sign in as the student to see the new status.

## 7. Verify data in MySQL
```
mysql -u root -p home_tutor_finder
SELECT id, full_name, email, role, LEFT(password_hash,7) AS hash_prefix FROM users;
SELECT * FROM tutor_profiles;
SELECT id, status, requested_date FROM tutoring_requests;
```
`hash_prefix` should start with `$2a$`/`$2b$` (BCrypt).

## 8. Test protected APIs in Swagger UI
1. Open http://localhost:8080/swagger-ui.html, run **POST /api/auth/login** with a registered email/password. The browser stores the HttpOnly cookie.
2. Now call e.g. `GET /api/auth/me`, `GET /api/requests/student/me` (student) or `GET /api/tutors/me/profile` (tutor). Calling the wrong role's endpoint returns 403; before login returns 401.

Sample login request: `{"email":"you@example.com","password":"Passw0rd1"}` → `{"id":1,"fullName":"…","email":"…","phone":"…","role":"STUDENT"}`

## Security notes
- JWT is stored only in an HttpOnly cookie. CSRF tokens are not used because the API is stateless, the cookie is `SameSite=Lax`, CORS allows only `FRONTEND_ORIGIN`, and all state-changing endpoints require JSON bodies.
- Set `COOKIE_SECURE=true` and serve over HTTPS in production. Cookie-based auth between frontend and backend needs them on the same site (e.g. `app.example.com` and `api.example.com`); the Next.js middleware only checks that the cookie exists, the backend does the real authorization.
- Forgot Password shows a clear “not configured” page; no email provider is set up.
- Privacy/Terms/Contact pages are placeholders to be replaced.
- Tutor `average_rating` is empty because there is no reviews feature yet; ratings are only shown when present.
- Students can initiate payment only after tutor acceptance. Once an order is created, cancellation is disabled; paid-session refunds must be handled manually until a refund workflow is added. Payment uses Razorpay test mode if test credentials are configured.

## Common errors
| Problem | Fix |
|---|---|
| `Could not resolve placeholder 'DB_PASSWORD'` / `'JWT_SECRET'` | Create `backend/.env` (step 3) and run from the `backend` folder. |
| `JWT_SECRET must be at least 32 characters` | Use a longer secret. |
| `Access denied for user 'root'` | Wrong `DB_PASSWORD`/`DB_USERNAME`. |
| `Unknown database 'home_tutor_finder'` | Run the `CREATE DATABASE` command (step 2). |
| `Schema-validation: wrong column type` | Migration and entity differ; don't edit applied migrations, add a new `V4__…sql`. |
| Browser shows “Cannot reach the server” | Backend not running or `NEXT_PUBLIC_API_URL` wrong. |
| Signed in but redirected to Sign In | Frontend and backend must both use `localhost` (not `127.0.0.1` for one of them). |
| CORS error | `FRONTEND_ORIGIN` must exactly match the frontend URL. |
| `Port 8080 / 3001 already in use` | Stop the other program using that port before starting the app. |
