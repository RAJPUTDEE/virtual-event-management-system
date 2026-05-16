# Virtual Event Management System

Purpose
-------

This repository contains a minimal Express-based backend for managing virtual events. It is intended as a focused coding exercise and reference implementation showing:

- user registration and authentication (bcrypt + JWT)
- organizer-managed event CRUD operations
- attendee registration for events
- an in-memory test-oriented email outbox

Design summary
--------------

- Data store: in-memory structures (not persistent). Suitable for tests and evaluation.
- App layout: `src/appFactory.js` builds the Express app; `src/server.js` and root `app.js` are simple launchers.
- Services layer: business logic lives in `src/services/*` and routes are defined under `src/routes/*`.
- Tests: integration-style tests using Jest + Supertest live in `tests/app.test.js` and demonstrate typical API usage.

Tech stack
----------

- Node.js (CommonJS)
- Express
- bcrypt for password hashing
- jsonwebtoken for tokens
- nodemailer (json transport) for capturing emails during tests
- Jest + Supertest for automated tests

Project structure
-----------------

- [app.js](app.js) — repository root launcher (starts the server)
- [src/server.js](src/server.js) — creates app from factory and conditionally starts server
- [src/appFactory.js](src/appFactory.js) — Express app factory (routes & middleware)
- [src/services/](src/services/) — application services (auth, events, email)
- [src/routes/](src/routes/) — route handlers
- [src/middleware/](src/middleware/) — auth middleware
- [src/store.js](src/store.js) — in-memory data store used by services and tests
- [tests/app.test.js](tests/app.test.js) — integration tests & usage examples

Prerequisites
-------------

- Node.js 16+ (LTS recommended)
- npm 9+

Install
-------

```bash
npm install
```

Run (development)
-----------------

```bash
npm start
# or
node app.js
```

The server uses `PORT` (default 3000). A quick health check is available at `GET /health`.

Testing
-------

```bash
npm test
```

The tests exercise registration, authentication, organizer workflows, attendee registration, and verify that emails are queued into the in-memory outbox.

API reference (summary)
-----------------------

All endpoints that modify or read private resources require an `Authorization: Bearer <token>` header obtained from `POST /login`.

- `POST /register` — create user
  - body (JSON): `{ "name": "Alice", "email": "alice@example.com", "password": "pass", "role": "attendee" }`
- `POST /login` — authenticate
  - body (JSON): `{ "email": "alice@example.com", "password": "pass" }`
  - response: `{ token, user }`
- `GET /events` — list events (auth required)
- `POST /events` — create event (organizer only)
  - body (JSON): `{ "title": "Name", "date": "YYYY-MM-DD", "time": "HH:MM", "description": "..." }`
- `GET /events/:id` — get event
- `PUT /events/:id` — update event (organizer only)
- `DELETE /events/:id` — delete event (organizer only)
- `POST /events/:id/register` — register authenticated attendee for event

Usage examples
--------------

Prefer using a modern HTTP client (Postman, Insomnia, or HTTPie) or the tests in `tests/app.test.js` as a reference. The tests provide concrete request/response flows suitable for reproducing the API interactions.

Configuration and security
--------------------------

- `JWT_SECRET` — supply a secure secret in the environment for token signing; do not commit secrets to the repository.
- This project uses an in-memory store and is not suitable for production without replacing the storage layer and adding persistent configuration.

Why this layout
----------------

The separation between `appFactory.js` and `server.js` makes the Express app easy to import in tests without starting an HTTP listener, keeping tests fast and reliable.

Advantages
----------

- Small and self-contained — easy to review and extend for assessments.
- Includes automated tests demonstrating expected behavior.
- Clear separation of concerns (routes, services, middleware).

Extending for production
------------------------

- Replace `src/store.js` with a persistent datastore (Postgres, MongoDB, etc.).
- Add configuration management (dotenv or a secrets manager) and secure default policies.
- Integrate a proper email transport (SMTP or provider) and rate limiting.

Contact / notes
---------------

If you want this README further tailored for a specific submission format (one-line summary, required repo fields, or a portal template), provide the exact template and I will produce the text to paste into the submission portal.
