const request = require('supertest');
const { createApp } = require('../src/appFactory');
const { resetStore, state } = require('../src/store');

const app = createApp();

async function registerUser(payload) {
  return request(app).post('/register').send(payload);
}

async function loginUser(payload) {
  return request(app).post('/login').send(payload);
}

beforeEach(() => {
  resetStore();
});

describe('authentication', () => {
  test('registers a user and hashes the password', async () => {
    const response = await registerUser({
      name: 'Organizer One',
      email: 'org@example.com',
      password: 'secret123',
      role: 'organizer'
    });

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({
      name: 'Organizer One',
      email: 'org@example.com',
      role: 'organizer'
    });
    expect(response.body.user.password).toBeUndefined();
    expect(state.users).toHaveLength(1);
  });

  test('logs in a user and returns a JWT', async () => {
    await registerUser({
      name: 'Attendee One',
      email: 'attendee@example.com',
      password: 'secret123',
      role: 'attendee'
    });

    const response = await loginUser({
      email: 'attendee@example.com',
      password: 'secret123'
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({
      email: 'attendee@example.com',
      role: 'attendee'
    });
  });
});

describe('event management', () => {
  test('allows organizers to create, update, list, and delete events', async () => {
    await registerUser({
      name: 'Organizer One',
      email: 'org@example.com',
      password: 'secret123',
      role: 'organizer'
    });

    const loginResponse = await loginUser({
      email: 'org@example.com',
      password: 'secret123'
    });

    const token = loginResponse.body.token;

    const createResponse = await request(app)
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Virtual Launch',
        date: '2026-06-01',
        time: '10:00',
        description: 'Product launch event'
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.event).toMatchObject({
      title: 'Virtual Launch',
      participants: []
    });

    const eventId = createResponse.body.event.id;

    const updateResponse = await request(app)
      .put(`/events/${eventId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Virtual Launch Updated',
        date: '2026-06-02',
        time: '11:00',
        description: 'Updated product launch event'
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.event.title).toBe('Virtual Launch Updated');

    const listResponse = await request(app)
      .get('/events')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.events).toHaveLength(1);

    const deleteResponse = await request(app)
      .delete(`/events/${eventId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);
    expect(state.events).toHaveLength(0);
  });

  test('prevents attendees from creating events', async () => {
    await registerUser({
      name: 'Attendee One',
      email: 'attendee@example.com',
      password: 'secret123',
      role: 'attendee'
    });

    const loginResponse = await loginUser({
      email: 'attendee@example.com',
      password: 'secret123'
    });

    const response = await request(app)
      .post('/events')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send({
        title: 'Blocked Event',
        date: '2026-06-01',
        time: '10:00',
        description: 'Should not be created'
      });

    expect(response.status).toBe(403);
  });
});

describe('event registration', () => {
  test('registers an attendee for an event and queues an email', async () => {
    await registerUser({
      name: 'Organizer One',
      email: 'org@example.com',
      password: 'secret123',
      role: 'organizer'
    });

    await registerUser({
      name: 'Attendee One',
      email: 'attendee@example.com',
      password: 'secret123',
      role: 'attendee'
    });

    const organizerLogin = await loginUser({
      email: 'org@example.com',
      password: 'secret123'
    });

    const attendeeLogin = await loginUser({
      email: 'attendee@example.com',
      password: 'secret123'
    });

    const createResponse = await request(app)
      .post('/events')
      .set('Authorization', `Bearer ${organizerLogin.body.token}`)
      .send({
        title: 'Networking Hour',
        date: '2026-07-01',
        time: '18:00',
        description: 'Community networking session'
      });

    const eventId = createResponse.body.event.id;

    const registrationResponse = await request(app)
      .post(`/events/${eventId}/register`)
      .set('Authorization', `Bearer ${attendeeLogin.body.token}`);

    expect(registrationResponse.status).toBe(201);
    expect(registrationResponse.body.event.participants).toHaveLength(1);
    expect(registrationResponse.body.attendee.email).toBe('attendee@example.com');
    expect(state.users[1].registrations).toContain(eventId);
    expect(state.emailOutbox).toHaveLength(1);
  });

  test('rejects duplicate registrations', async () => {
    await registerUser({
      name: 'Organizer One',
      email: 'org@example.com',
      password: 'secret123',
      role: 'organizer'
    });

    await registerUser({
      name: 'Attendee One',
      email: 'attendee@example.com',
      password: 'secret123',
      role: 'attendee'
    });

    const organizerLogin = await loginUser({
      email: 'org@example.com',
      password: 'secret123'
    });

    const attendeeLogin = await loginUser({
      email: 'attendee@example.com',
      password: 'secret123'
    });

    const createResponse = await request(app)
      .post('/events')
      .set('Authorization', `Bearer ${organizerLogin.body.token}`)
      .send({
        title: 'Networking Hour',
        date: '2026-07-01',
        time: '18:00',
        description: 'Community networking session'
      });

    const eventId = createResponse.body.event.id;

    await request(app)
      .post(`/events/${eventId}/register`)
      .set('Authorization', `Bearer ${attendeeLogin.body.token}`);

    const duplicateResponse = await request(app)
      .post(`/events/${eventId}/register`)
      .set('Authorization', `Bearer ${attendeeLogin.body.token}`);

    expect(duplicateResponse.status).toBe(409);
  });
});