# Virtual Event Management System

Lightweight backend API for managing virtual events. Uses in-memory data structures for users, events, and registrations. Includes secure authentication (bcrypt + JWT), organizer-only event management, attendee registration, and an in-memory email outbox used for testing.

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Run tests (should pass)

```bash
npm test
```

3. Start the API server

```bash
npm start
# or
node app.js
```

Open http://localhost:3000/ in a browser to see the landing page and http://localhost:3000/health for a JSON health check.

## Configuration

- PORT: server port (default 3000)
- JWT_SECRET: secret used to sign JWT tokens. DO NOT commit production secrets.

Create a `.env` file (ignored by Git) or export environment variables before starting the server.

## API Endpoints (overview)

- POST /register — create a user (body: name, email, password, role: organizer|attendee)
- POST /login — login and receive a JWT (body: email, password)
- GET /events — list events (requires Authorization header)
- POST /events — create event (organizer only)
- GET /events/:id — event details
- PUT /events/:id — update event (organizer only)
- DELETE /events/:id — delete event (organizer only)
- POST /events/:id/register — register authenticated user for an event

See the tests in [tests/app.test.js](tests/app.test.js) for example request/response flows.

## Testing

- The project uses Jest and Supertest. Run `npm test` to execute the full suite.
- Tests cover registration, authentication, organizer-only CRUD, attendee registration, and email queueing.

## Security & Submission Notes

- Do not commit secrets. The project reads `JWT_SECRET` from environment; provide a secure value in production.
- The repository currently contains a `package-lock.json` and `node_modules/` (node_modules is gitignored). It's normal to include the lockfile for reproducible installs.
- `npm audit` reported some dependency vulnerabilities during development; before final submission you may run `npm audit fix` or `npm audit fix --force` and re-run tests.

## What to Submit

- GitHub repository link (make sure the repo is public).
- External demo URL (optional): if your submission form asks for an external link (recording, drive, or demo), include the URL here. Example placeholder: EXTERNAL_DEMO_URL

Add your GitHub repo link and any external demo link here before submitting the assignment.

## Files of interest

- The API entry: [app.js](app.js) and [src/server.js](src/server.js)
- Core services: [src/services/authService.js](src/services/authService.js), [src/services/eventService.js](src/services/eventService.js)
- Tests: [tests/app.test.js](tests/app.test.js)

## Next steps (recommended)

- Run `npm audit` and address high/critical issues.
- Add a short README section with the GitHub repo URL and external demo URL to paste into your submission portal.
- When ready, create a single focused commit and push to your public GitHub repository.

-----
Small, self-contained project intended for assignment evaluation. If you want, I can prepare the exact submission text to paste into your assignment portal including the repo and external links.