# Virtual Event Management System

Backend API for managing virtual events with in-memory data, JWT authentication, organizer permissions, attendee registration, and email notifications on successful registration.

## Setup

1. Install dependencies with `npm install`.
2. Run the test suite with `npm test`.
3. Start the API with `npm start`.

## Environment Variables

- `PORT` - server port, defaults to `3000`
- `JWT_SECRET` - secret used to sign tokens, defaults to a local development value

## Main Endpoints

- `POST /register` - create a user account
- `POST /login` - authenticate a user and receive a JWT
- `GET /events` - list all events for authenticated users
- `POST /events` - create an event as an organizer
- `GET /events/:id` - fetch a single event
- `PUT /events/:id` - update an event as the owning organizer
- `DELETE /events/:id` - delete an event as the owning organizer
- `POST /events/:id/register` - register the authenticated user for an event

## Notes

- User, event, and registration data are stored in memory.
- Successful event registration queues an email notification through an in-memory mail outbox.